rulebase {
  security {
    rules {
      Deny-SSH-to-Inside {
        to outside;
        from inside;
        source 10.10.0.0/16;
        destination 192.168.3.0/24;
        port 22
        source-user any;
        application SSH;
        action deny;
      }
      Allow-SSH-to-Outside {
        to outside;
        from inside;
        source 10.10.0.0/16;
        destination 192.168.3.0/24;
        port 22;
        source-user any;
        application SSH;
        action allow;
      }
      allow-all-outside {
        to inside;
        from outside;
        source any;
        destination any;
        source-user any;
        application any;
        action allow;
      }
      deny-all-inside {
        to inside;
        from outside;
        source any;
        destination any;
        source-user any;
        application any;
        action deny;
      }
      secure-to-servers {
        to inside;
        from secure;
        source secure-zone-nets;
        destination [ net001.0-24 net002.0-24 net003.0-24 net004.0-24];
        source-user any;
        application any;
        action allow;
      }
      secure-to-servers-test {
        to inside;
        from secure;
        source [secure-zone-nets random-group];
        destination [ net001.0-24 net002.0-24 net003.0-24 net004.0-24 secure-zone-nets];
        source-user any;
        application any;
        action allow;
      }
      tech-to-iperf {
        to dmz;
        from outside;
        source 192.168.1.7;
        destination [ iperf3];
        source-user      any;
        application any;
        action allow;
      }
    }
  }
}

address {
  net001.0-24 { ip-netmask 10.10.1.0/24;   }
  net002.0-24 { ip-netmask 10.10.2.0/24;   }
  net003.0-24 { ip-netmask 10.10.3.0/24;   }
  net004.0-24 { ip-netmask 10.10.4.0/24;   }
  net005.0-24 { ip-netmask 10.10.5.0/24;   }
  net006.0-24 { ip-netmask 10.10.6.0/24;   }
  iperf3      { ip-netmask 10.10.5.22/32;  }
  192.168.1.7 { ip-netmask 192.168.1.7/32; }
}

address-group {
  secure-zone-nets {
    static [    net005.0-24 net006.0-24 ];
  }
  random-group {
    static [net002.0-24 iperf3 net004.0-24    ];
  }
}
