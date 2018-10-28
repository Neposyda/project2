import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = 'MySecretKey' #os.getenv("SECRET_KEY")
socketio = SocketIO(app)
cont = {'users': [], 'chanels': [], 'messages': {}}


@app.route("/")
def index():
    return render_template('index.html')


@socketio.on('submit nick')
def addnick(data):
    isnew=False
    if not(data['nick'] in cont['users']):
        cont['users'].insert(0, data['nick'])
        isnew=True
    emit('announce nick', [isnew, cont], broadcast=isnew) #а якщо без броадкаст- то чи будуть поновдятися інші відкриті сторінки


@socketio.on('submit chn')
def addchn(data):
    isnew = True
    for item in cont['chanels']:
        if data['chn'] == item[0]:
            isnew = False
            break
    if isnew:
        cont['chanels'].append([data['chn'], data['usr'], data['dt']])
        cont['messages'][data['chn']] = []
    emit('announce chn', [isnew, cont], broadcast=isnew)


@socketio.on('submit addmsg')
def addmsg(data):
    cont['messages'][data['chn']].append([data['msg'], data['usr'], data['dt']])
    emit('announce addmsg', [data['chn'], cont['messages'][data['chn']]], broadcast=True)


@socketio.on('submit lichn')
def selchn(data):
    # ismsg = (cont['messages'][data[0]] == [])
    emit('announce lichn', cont['messages'][data['chn']], broadcast=False)