

export const as3ExampleDec = {
    "$schema": "https://raw.githubusercontent.com/F5Networks/f5-appsvcs-extension/master/schema/latest/as3-schema.json",
    "class": "AS3",
    "action": "deploy",
    "persist": true,
    "declaration": {
        "class": "ADC",
        "schemaVersion": "3.0.0",
        "id": "urn:uuid:33045210-3ab8-4636-9b2a-c98d22ab915d",
        "label": "Sample 1",
        "remark": "Simple HTTP application with RR pool",
        "Sample_01": {
            "class": "Tenant",
            "A1": {
                "class": "Application",
                "template": "http",
                "serviceMain": {
                    "class": "Service_HTTP",
                    "virtualAddresses": [
                        "10.0.1.10"
                    ],
                    "pool": "web_pool"
                },
                "web_pool": {
                    "class": "Pool",
                    "monitors": [
                        "http"
                    ],
                    "members": [
                        {
                            "servicePort": 80,
                            "serverAddresses": [
                                "192.0.1.10",
                                "192.0.1.11"
                            ]
                        }
                    ]
                }
            }
        }
    }
}


export const doExampleDec = {
    "class": "DO",
    "declaration": {
        "schemaVersion": "1.5.0",
        "class": "Device",
        "async": true,
        "Common": {
            "class": "Tenant",
            "myProvision": {
                "ltm": "nominal",
                "class": "Provision"
            },
            "admin": {
                "class": "User",
                "userType": "regular",
                "password": "privatepassword",
                "partitionAccess": {
                    "all-partitions": {
                        "role": "admin"
                    }
                }
            },
            "hostname": "aws.ve.do.demo"
        }
    },
    "targetUsername": "admin",
    "targetHost": "54.10.10.10",
    "targetSshKey": {
        "path": "/var/ssh/restnoded/private.pem"
    },
    "bigIqSettings": {
        "failImportOnConflict": false,
        "conflictPolicy": "USE_BIGIQ",
        "deviceConflictPolicy": "USE_BIGIP",
        "versionedConflictPolicy": "KEEP_VERSION"
    }
}

export const deviceExampleDec = {
    "$schema": "https://raw.githubusercontent.com/F5Networks/f5-declarative-onboarding/master/src/schema/latest/base.schema.json",
    "schemaVersion": "1.0.0",
    "class": "Device",
    "async": true,
    "webhook": "https://example.com/myHook",
    "label": "my BIG-IP declaration for declarative onboarding",
    "Common": {
        "class": "Tenant",
        "mySystem": {
            "class": "System",
            "hostname": "bigip.example.com",
            "cliInactivityTimeout": 1200,
            "consoleInactivityTimeout": 1200,
            "autoPhonehome": false
        },
        "myLicense": {
            "class": "License",
            "licenseType": "regKey",
            "regKey": "AAAAA-BBBBB-CCCCC-DDDDD-EEEEEEE"
        },
        "myDns": {
            "class": "DNS",
            "nameServers": [
                "8.8.8.8",
                "2001:4860:4860::8844"
            ],
            "search": [
                "f5.com"
            ]
        },
        "myNtp": {
            "class": "NTP",
            "servers": [
                "0.pool.ntp.org",
                "1.pool.ntp.org",
                "2.pool.ntp.org"
            ],
            "timezone": "UTC"
        },
        "root": {
            "class": "User",
            "userType": "root",
            "oldPassword": "default",
            "newPassword": "myNewPass1word"
        },
        "admin": {
            "class": "User",
            "userType": "regular",
            "password": "asdfjkl",
            "shell": "bash"
        },
        "guestUser": {
            "class": "User",
            "userType": "regular",
            "password": "guestNewPass1",
            "partitionAccess": {
                "Common": {
                    "role": "guest"
                }
            }
        },
        "anotherUser": {
            "class": "User",
            "userType": "regular",
            "password": "myPass1word",
            "shell": "none",
            "partitionAccess": {
                "all-partitions": {
                    "role": "guest"
                }
            }
        },
        "myProvisioning": {
            "class": "Provision",
            "ltm": "nominal",
            "gtm": "minimum"
        },
        "internal": {
            "class": "VLAN",
            "tag": 4093,
            "mtu": 1500,
            "interfaces": [
                {
                    "name": "1.2",
                    "tagged": true
                }
            ],
            "cmpHash": "dst-ip"
        },
        "internal-self": {
            "class": "SelfIp",
            "address": "10.10.0.100/24",
            "vlan": "internal",
            "allowService": "default",
            "trafficGroup": "traffic-group-local-only"
        },
        "external": {
            "class": "VLAN",
            "tag": 4094,
            "mtu": 1500,
            "interfaces": [
                {
                    "name": "1.1",
                    "tagged": true
                }
            ],
            "cmpHash": "src-ip"
        },
        "external-self": {
            "class": "SelfIp",
            "address": "10.20.0.100/24",
            "vlan": "external",
            "allowService": "none",
            "trafficGroup": "traffic-group-local-only"
        },
        "default": {
            "class": "Route",
            "gw": "10.10.0.1",
            "network": "default",
            "mtu": 1500
        },
        "managementRoute": {
            "class": "ManagementRoute",
            "gw": "1.2.3.4",
            "network": "default",
            "mtu": 1500
        },
        "myRouteDomain": {
            "class": "RouteDomain",
            "id": 100,
            "bandWidthControllerPolicy": "bwcPol",
            "connectionLimit": 5432991,
            "flowEvictionPolicy": "default-eviction-policy",
            "ipIntelligencePolicy": "ip-intelligence",
            "enforcedFirewallPolicy": "enforcedPolicy",
            "stagedFirewallPolicy": "stagedPolicy",
            "securityNatPolicy": "securityPolicy",
            "servicePolicy": "servicePolicy",
            "strict": false,
            "routingProtocols": [
                "RIP"
            ],
            "vlans": [
                "external"
            ]
        },
        "dbvars": {
            "class": "DbVariables",
            "ui.advisory.enabled": true,
            "ui.advisory.color": "green",
            "ui.advisory.text": "/Common/hostname"
        }
    }
}


export const tsExampleDec = {
    "$schema": "https://raw.githubusercontent.com/F5Networks/f5-telemetry-streaming/master/src/schema/latest/base_schema.json",
    "class": "Telemetry",
    "My_System": {
        "class": "Telemetry_System",
        "systemPoller": {
            "interval": 60
        }
    },
    "My_Listener": {
        "class": "Telemetry_Listener",
        "port": 6514
    },
    "My_Consumer": {
        "class": "Telemetry_Consumer",
        "type": "Splunk",
        "host": "192.0.2.1",
        "protocol": "https",
        "port": 8088,
        "passphrase": {
            "cipherText": "apikey"
        }
    }
}

export const cfExampleDec = {
    "$schema": "https://raw.githubusercontent.com/F5Networks/f5-cloud-failover-extension/master/src/nodejs/schema/base_schema.json",
    "class": "Cloud_Failover",
    "environment": "azure",
    "schemaVersion": "0.9.1",
    "externalStorage": {
        "scopingTags": {
            "f5_cloud_failover_label": "mydeployment"
        }
    },
    "failoverAddresses": {
        "scopingTags": {
            "f5_cloud_failover_label": "mydeployment"
        }
    },
    "failoverRoutes": {
        "scopingTags": {
            "f5_cloud_failover_label": "mydeployment"
        },
        "scopingAddressRanges": [
            {
                "range": "192.0.2.0/24"
            }
        ],
        "defaultNextHopAddresses": {
            "discoveryType": "static",
            "items": [
                "192.0.2.10",
                "192.0.2.11"
            ]
        }
    },
    "controls": {
        "class": "Controls",
        "logLevel": "info"
    }
}