import executor_utils as eu
import json
from flask import Flask
from flask import jsonify
from flask import request


app = Flask(__name__)


@app.route('/')

def hello():
    return 'hello world'

# @app.route('/build_and_run',methods=['POST'])
# def build_and_run():
#     data = json.loads(request.data)
#     if 'code' not in data or 'lan' not in data:
#         return 'you should provide both code and lan'
#     code = data['code']
#     lan = data['lan']

#     print 'API get caller with code %s in %s' %(code,lan)
    
#     return jsonify({'build': 'build from flask', 'run': 'hello from flask'})

@app.route('/build_and_run', methods=['POST'])
def build_and_run():
    data = json.loads(request.data)
    if 'code' not in data or 'lan' not in data:
        return 'you should provide both code and lang'
    code = data['code']
    lan = data['lan']

    print 'API got called with code %s in %s' % (code, lan)
    #return jsonify({'build': 'build from flask', 'run': 'hello from flask'})
    result = eu.build_and_run(code, lan)
    return jsonify(result)

if __name__ == '__main__':
    import sys
    # flask default port 5000
    port = int(sys.argv[1])
    eu.load_image()
    app.run(port = port)