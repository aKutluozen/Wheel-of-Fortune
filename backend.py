#!flask/bin/python

from flask import Flask, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"*": {"origins": "*"}})

@app.route('/', methods = ['POST'])
def save():
    data = request.get_json(force=True)
    f = open("log.txt", "a")
    f.write(data['prize'] + '|' + str(datetime.now()) + '|' + str(data['customer']) + ',\n')
    f.close()
    return 'success'

if __name__ == "__main__":
	app.run()