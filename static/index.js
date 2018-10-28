localStorage.clear();
localStorage.setItem('selchn','');
localStorage.setItem('curuser','');
localStorage.setItem('start',true);
document.addEventListener('DOMContentLoaded', ()=> {
    document.querySelector('#nick').onkeyup = () => {
        if (document.querySelector('#nick').value.length = 0)
            document.querySelector('#addnick').disabled = true;
        else
            document.querySelector('#addnick').disabled = false
    };

    document.querySelector('#chn').onkeyup = () => {
        if (document.querySelector('#chn').value.length > 0)
            document.querySelector('#addchn').disabled = false;
        else
            document.querySelector('#addchn').disabled = true;
    };

    document.querySelector('#msg').onkeyup = () => {
        if (document.querySelector('#msg').value.length > 0)
            document.querySelector('#addmsg').disabled = false;
        else
            document.querySelector('#addmsg').disabled = true;
    };

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    socket.on('connect', () => {

        document.querySelector('#addnick').onclick = () => {
             const nick = document.querySelector('#nick').value;
            //перев чи імя вже вик. в юзерах на локал сторедж
            if (localStorage.getItem('users') != null) {
                usrsinlcst = JSON.parse(localStorage.getItem('users'));
                for (i in usrsinlcst) {
                    if (nick == usrsinlcst[i]) {
                        document.querySelector('#msgnick').innerHTML="Ім'я "+ nick + " використовується(oncl addnick).";
                        return false;
                    };
                };
            }
            localStorage.setItem('curuser',nick+'start');
            socket.emit('submit nick', {'nick': document.querySelector('#nick').value});
        };

        document.querySelector('#addchn').onclick = () => {
            document.querySelector('#msgchn').innerHTML='';
            const newchn = document.querySelector('#chn').value;
            if (newchn == '') {
                return false;
            }
            localStorage.setItem('curchn', newchn);
            dt = new Date();
            document.querySelector('#chn').value='';
            socket.emit('submit chn', {'chn': newchn, 'usr': document.querySelector('#nick').value, 'dt': dt});
        };

        document.querySelector('#addmsg').onclick = () => {
            const newmsg = document.querySelector('#msg').value;
            dt = new Date();
            document.querySelector('#msg').value='';
            socket.emit('submit addmsg', {'chn':localStorage.getItem('selchn'), 'msg': newmsg, 'usr': document.getElementById('nick').value, 'dt': dt});
        };

        document.querySelector('#chns').onclick=(e)=>{
            selchn=e.target.id;
            document.querySelector('#msgchn').innerHTML=selchn;
            localStorage.setItem('selchn', selchn);
            socket.emit('submit lichn', {'chn': selchn});
        };

        socket.on('announce nick', data => {
            if (!data[0] && localStorage.getItem('curuser')==data[1]['users'][0]+'start' ) {
                localStorage.setItem('curuser', '');
                document.querySelector('#msgnick').innerHTML="Ім'я "+ document.querySelector('#nick').value + " вже використовується(ann nick)."
            }
            else {
                localStorage.setItem('users', JSON.stringify(data[1]['users']));
                filluppage();
            };
        });

        socket.on('announce chn', data => {
            if (data[0]) {
                localStorage.setItem('chanels', JSON.stringify(data[1]['chanels']));
                filluppage();
            }
            else
                document.querySelector('#msgchn').innerHTML="Канал: :" + document.querySelector('#chn').value + " вже створений. Виберіть іншу назву.(ann chn)";
        });

        socket.on('announce lichn', data => {
            // if (data!='')
            fillupmsgs(data);
            document.querySelector('#msg').disabled=false;
        });

        socket.on('announce addmsg', data => {
           if (data[0]==localStorage.getItem('selchn'))
            fillupmsgs(data[1]);
        });
    });

    function filluppage() {
        //заповнюєм юзерів
        usrs = JSON.parse(localStorage.getItem('users'));
        if (usrs != null) {
            strdop = usrs[0];
            for (item = 1; item < usrs.length; item++)
                strdop = strdop + ", " + usrs[item]

            document.querySelector('#msgnick').innerText = strdop;
            if (localStorage.getItem('curuser')==usrs[0]+'start'){
                document.querySelector('#nick').disabled = true;
                document.querySelector('#addnick').disabled = true;
                document.querySelector('#chn').disabled = false;
            };
        }

        //заповнюєм канали
        chns = JSON.parse(localStorage.getItem('chanels'));
        if (chns != null) {
            listchns = document.querySelector('#chns');
            // очищаєм список каналів
            while (listchns.firstChild) {
                listchns.removeChild(listchns.firstChild);
            }
            //заповнюєм список каналів
            for (item in chns) {
                const lichn = document.createElement('li');
                lichn.setAttribute('class',"list-group-item");
                lichn.id = chns[item][0];
                lichn.name='chnname';
                lichn.innerText = chns[item][0] + '(cr.' + chns[item][1] + ')';
                listchns.append(lichn);
            }
            // document.querySelector('#msg').disabled=false;
        }
    }

    function fillupmsgs(selchnmsgs){
        // заповнюєм повідомлення
        const msgs=document.querySelector('#msgs');
        while (msgs.firstChild)
            msgs.removeChild(msgs.firstChild);
        for (item in selchnmsgs){
            const limsgs=document.createElement('li');
            limsgs.setAttribute("class", "list-group-item");
            // limsgs.class="list-group-item";
            limsgs.innerText = selchnmsgs[item][1] + ' --- ' + selchnmsgs[item][2] + '\n' + selchnmsgs[item][0];
            msgs.append(limsgs);
        }
        // document.querySelector('#msg').disabled=false;
    }
});

