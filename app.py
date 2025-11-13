from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit
import docker
import threading

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")
client = docker.from_env()

# Store active terminal sessions
terminal_sessions = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/student')
def student():
    return render_template('student.html')

# List all student containers
@app.route('/containers', methods=['GET'])
def list_containers():
    containers = []
    for c in client.containers.list(all=True):
        try:
            image_name = c.image.tags[0] if c.image.tags else 'untagged'
        except Exception:
            image_name = 'unknown'  # Fallback if image not found

        containers.append({
            'id': c.short_id,
            'name': c.name,
            'status': c.status,
            'image': image_name,
        })
    return jsonify(containers)


# Create a new student container with wettyoss/wetty
@app.route('/start_container', methods=['POST'])
def start_container():
    data = request.get_json()
    name = data.get('name', f'student_{len(client.containers.list(all=True)) + 1}')
    port = 5050 + len(client.containers.list())
    
    # Get resource limits and tools
    cpu_limit = data.get('cpu_cores', 1.0)
    mem_limit = data.get('memory_mb', 512)
    tools = data.get('tools', [])

    try:
        # Start base container with iframe support
        container = client.containers.run(
            image='wettyoss/wetty',
            name=name,
            detach=True,
            tty=True,
            ports={'3000/tcp': port},
            command=["node", ".", "--base", "/", "--command", "/bin/sh", "--allow-iframe"],
            cpu_quota=int(cpu_limit * 100000),
            cpu_period=100000,
            mem_limit=f'{mem_limit}m',
            memswap_limit=f'{mem_limit}m',
            user='root',  # Need root to install packages
            labels={
                'tools': ','.join(tools),
                'cpu_cores': str(cpu_limit),
                'memory_mb': str(mem_limit)
            }
        )
        
        # Install selected tools
        if tools:
            packages = []
            
            # Compilers & Interpreters
            if 'gcc' in tools:
                packages.extend(['gcc', 'musl-dev', 'libc-dev'])
            if 'g++' in tools:
                packages.extend(['g++', 'musl-dev', 'libc-dev'])
            if 'python' in tools:
                packages.extend(['python3', 'py3-pip'])
            if 'nodejs' in tools:
                packages.append('nodejs')
            if 'java' in tools:
                packages.append('openjdk11')
            if 'go' in tools:
                packages.append('go')
            if 'rust' in tools:
                packages.extend(['rust', 'cargo'])
            if 'perl' in tools:
                packages.append('perl')
            
            # Build Tools
            if 'make' in tools:
                packages.append('make')
            if 'cmake' in tools:
                packages.append('cmake')
            if 'npm' in tools:
                packages.append('npm')
            if 'pip' in tools:
                packages.append('py3-pip')
            
            # Development Tools
            if 'git' in tools:
                packages.append('git')
            if 'vim' in tools:
                packages.append('vim')
            if 'nano' in tools:
                packages.append('nano')
            if 'curl' in tools:
                packages.append('curl')
            if 'wget' in tools:
                packages.append('wget')
            if 'gdb' in tools:
                packages.append('gdb')
            if 'valgrind' in tools:
                packages.append('valgrind')
            
            if packages:
                # Install packages in the running container
                install_cmd = f"apk update && apk add --no-cache {' '.join(packages)}"
                exec_result = container.exec_run(
                    cmd=['sh', '-c', install_cmd],
                    user='root'
                )
                
                if exec_result.exit_code != 0:
                    print(f"Warning: Installation had issues: {exec_result.output.decode()}")
        
        return jsonify({
            'success': True,
            'id': container.short_id,
            'name': name,
            'tools': tools,
            'port': port,
            'url': f'http://localhost:{port}',
            'cpu_cores': cpu_limit,
            'memory_mb': mem_limit
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# container stats
@app.route('/container_stats/<string:container_id>', methods=['GET'])
def container_stats(container_id):
    try:
        container = client.containers.get(container_id)
        stats = container.stats(stream=False)

        # Calculate CPU %
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats']['system_cpu_usage']
        num_cpus = len(stats['cpu_stats']['cpu_usage'].get('percpu_usage', [])) or 1
        cpu_percent = (cpu_delta / system_delta) * num_cpus * 100.0 if system_delta > 0 and cpu_delta > 0 else 0.0

        # Memory in MB
        mem_usage = stats['memory_stats']['usage'] / 1024 ** 2

        return jsonify({
            'success': True,
            'cpu': round(cpu_percent, 2),
            'memory': round(mem_usage, 2)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Get detailed container information
@app.route('/container_details/<string:container_id>', methods=['GET'])
def container_details(container_id):
    try:
        container = client.containers.get(container_id)
        
        # Get resource limits
        host_config = container.attrs.get('HostConfig', {})
        cpu_quota = host_config.get('CpuQuota', 0)
        cpu_period = host_config.get('CpuPeriod', 100000)
        cpu_cores = cpu_quota / cpu_period if cpu_quota > 0 else 0
        
        mem_limit = host_config.get('Memory', 0)
        mem_limit_mb = mem_limit / (1024 * 1024) if mem_limit > 0 else 0
        
        # Try to extract tools from container name or labels
        tools = []
        labels = container.labels
        if 'tools' in labels:
            tools = labels['tools'].split(',')
        
        # Get the actual port mapping
        port_mapping = container.attrs.get('NetworkSettings', {}).get('Ports', {})
        terminal_port = None
        if '3000/tcp' in port_mapping and port_mapping['3000/tcp']:
            terminal_port = int(port_mapping['3000/tcp'][0]['HostPort'])
        
        return jsonify({
            'success': True,
            'cpu_cores': round(cpu_cores, 1) if cpu_cores > 0 else 'Unlimited',
            'memory_limit': round(mem_limit_mb) if mem_limit_mb > 0 else 'Unlimited',
            'tools': tools,
            'image': container.image.tags[0] if container.image.tags else 'unknown',
            'created': container.attrs.get('Created', ''),
            'name': container.name,
            'terminal_port': terminal_port
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Restart a stopped container
@app.route('/restart_container/<string:container_id>', methods=['POST'])
def restart_container(container_id):
    import docker
    try:
        container = client.containers.get(container_id)
        container.reload()

        # Handle all possible states
        if container.status == 'exited':
            container.start()
            msg = f"Container {container.name} started successfully."
        elif container.status == 'running':
            container.restart()
            msg = f"Container {container.name} restarted successfully."
        elif container.status in ['paused', 'created']:
            container.start()
            msg = f"Container {container.name} resumed successfully."
        else:
            container.start()
            msg = f"Container {container.name} started."

        return jsonify({'success': True, 'message': msg})

    except docker.errors.NotFound:
        return jsonify({'success': False, 'error': 'Container not found. Please refresh list.'}), 404
    except docker.errors.APIError as e:
        return jsonify({'success': False, 'error': f'Docker API error: {e.explanation}'})
    except PermissionError:
        return jsonify({'success': False, 'error': 'Permission denied to access Docker socket.'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})


# Stop a container
@app.route('/stop_container/<string:container_id>', methods=['POST'])
def stop_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.stop()
        return jsonify({'success': True, 'message': f'Container {container_id} stopped'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

# Remove a container
@app.route('/remove_container/<string:container_id>', methods=['DELETE'])
def remove_container(container_id):
    try:
        container = client.containers.get(container_id)
        container.remove(force=True)
        return jsonify({'success': True, 'message': f'Container {container_id} removed'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)})

@app.route('/terminal')
def terminal():
    return render_template('terminal.html')

@socketio.on('start_terminal')
def handle_start_terminal(data):
    container_id = data.get('container_id')
    print(f"start_terminal event received for container: {container_id}, session: {request.sid}")
    
    if not container_id:
        print("No container_id provided!")
        return
    
    sid = request.sid
    
    try:
        container = client.containers.get(container_id)
        exec_instance = container.exec_run(
            '/bin/sh',
            stdin=True,
            tty=True,
            socket=True,
            environment={'TERM': 'xterm-256color'}
        )
        
        sock = exec_instance.output._sock
        
        terminal_sessions[sid] = {
            'container': container,
            'socket': sock
        }
        
        # Start reading output
        def read_output():
            while True:
                try:
                    output_data = sock.recv(1024)
                    if not output_data:
                        break
                    socketio.emit('terminal_output', output_data.decode('utf-8', errors='ignore'), room=sid)
                except Exception as e:
                    print(f"Error reading output: {e}")
                    break
        
        thread = threading.Thread(target=read_output)
        thread.daemon = True
        thread.start()
        
    except Exception as e:
        emit('terminal_output', f'\r\nError: {str(e)}\r\n')

@socketio.on('terminal_input')
def handle_terminal_input(data):
    container_id = data.get('container_id')
    input_data = data.get('data')
    
    print(f"Received input: {repr(input_data)} for session {request.sid}")
    
    if request.sid in terminal_sessions:
        try:
            sock = terminal_sessions[request.sid]['socket']
            sock.sendall(input_data.encode('utf-8'))
            print(f"Sent input successfully")
        except Exception as e:
            print(f"Error sending input: {e}")
            emit('terminal_output', f'\r\nError sending input: {str(e)}\r\n')
    else:
        print(f"Session {request.sid} not found in terminal_sessions")
        print(f"Available sessions: {list(terminal_sessions.keys())}")

@socketio.on('disconnect')
def handle_disconnect():
    if request.sid in terminal_sessions:
        del terminal_sessions[request.sid]

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=False)
