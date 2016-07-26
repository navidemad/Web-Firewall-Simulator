rulebase {
           security {
             rules {
               allow-all-outside {
                 to inside;
                 from outside;
                 source any;
                 destination any;
                 source-user any;
                 category any;
                 application any;
                 service application-default;
                 hip-profiles any;
                 action allow;
                 log-setting 1-fwsyslog2;
               }
               deny-all-inside {
                 to inside;
                 from outside;
                 source any;
                 destination any;
                 source-user any;
                 category any;
                 application any;
                 service application-default;
                 hip-profiles any;
                 action deny;
                 log-setting 1-fwsyslog2;
               }
               secure-to-servers {
                 to inside;
                 from secure;
                 source secure-zone-nets;
                 destination [ net001.0-24 net002.0-24 net003.0-24 net004.0-24];
                 source-user any;
                 category any;
                 application any;
                 service application-default;
                 hip-profiles any;
                 action allow;
                 log-setting 1-fwsyslog2;
                 profile-setting {
                   group CSUSM-Threat;
                 }
               }
               tech-to-iperf {
                 profile-setting {
                   group CSUSM-Threat;
                 }
                 to dmz;
                 from outside;
                 source 192.168.1.7;
                 destination [ iperf3];
                 source-user any;
                 category any;
                 application any;
                 service application-default;
                 hip-profiles any;
                 action allow;
                 log-setting 1-fwsyslog2;
               }
         }
 }
}

address {
           net001.0-24 {
             ip-netmask 10.10.1.0/24;
           }
           net002.0-24 {
             ip-netmask 10.10.2.0/24;
           }
           net003.0-24 {
             ip-netmask 10.10.3.0/24;
           }
           net004.0-24 {
             ip-netmask 10.10.4.0/24;
           }
           net005.0-24 {
             ip-netmask 10.10.5.0/24;
           }
           net006.0-24 {
             ip-netmask 10.10.6.0/24;
           }
           iperf3 {
             ip-netmask 10.10.5.22/32;
           }
           192.168.1.7 {
             ip-netmask 192.168.1.7/32;
           }
}

address-group {
           secure-zone-nets {
             static [ net005.0-24 net006.0-24];
           }
           random-group {
             static [ net002.0-24 iperf3 net004.0-24];
             tag [ review 2016-07-11];
           }
}
