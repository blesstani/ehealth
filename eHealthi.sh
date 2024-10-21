#!/usr/bin/bash
# Copyright 2023 HolyCorn Software
# The eHealthi Project
# This file allows eHealthi to be run as a system-wide command

src="$(readlink -f $BASH_SOURCE)"
cd "$(dirname $src)"
appName=eHealthi

function enable_command () {

    commandPath=/usr/bin/$appName
    if [[ -f $commandPath ]]; then
        sudo rm -f $commandPath
    fi

    sudo ln -r -s $src /usr/bin/$appName

}

function put_env_variables(){
    echo "Which environment are we? Enter prod for production, dev for development"
    read env
    if [[ "$env" != "prod" ]]; then
        env="dev"
    fi
    export $(head ./$env.env -n 1)
    
}

function issue_cert () {
    echo "Please make sure the server is already running."
    sudo apt-get install -y certbot
    sudo certbot certonly --webroot -w ./faculty/web/html --agree-tos --register-unsafely-without-email -n -d $DOMAIN_SECURE
    sudo cp "/etc/letsencrypt/live/$DOMAIN_SECURE/fullchain.pem" $TLS_CERT
    sudo cp "/etc/letsencrypt/live/$DOMAIN_SECURE/privkey.pem" $TLS_KEY
}

case $1 in
    run)

        case $2 in
            dev|prod)
                export $(head ./$2.env -n 1)
                npm start
                ;;
            *)
                echo "Please specify the environment 'dev' or 'prod', for development, or production respectively."
                exit
                ;;
        esac
    ;;

    cert)

        case $2 in
            issue)
                put_env_variables
                issue_cert
                
                exit
            ;;

            *)
                echo -e "Unknown option: $2
Possible options are: issue"
                exit
            ;;
        esac
        
    ;;

    service)

        case $2 in
            enable)
                # First copy the service file
                sudo cp ./$appName.service /etc/systemd/system
                
                #Then make this eHealthi.sh available everywhere
                enable_command

                #Then reload the systemd service list
                sudo systemctl daemon-reload

                #Now, enable the service
                sudo systemctl enable $appName

                #At this point, let's make npm, and node available to the linux system
                nodeCmds=("npm" "node")
                for cmd in ${nodeCmds[@]}; do
                    cmdBinPath=/usr/bin/$cmd
                    if ! [ -f $cmdBinPath ]; then
                        cmdPath=$(which $cmd)
                        sudo ln -s -r $cmdPath $cmdBinPath
                        echo "Command $cmd linked to $cmdBinPath"

                        # When dealing with node, let's allow it to bind to port 80
                        if [ $cmd == "node" ]; then
                            sudo setcap cap_net_bind_service='+ep' $cmdPath
                            echo "Made $cmd capable of binding to port 80"
                        fi
                    fi
                done

                echo "$appName service enabled and '$appName' command activated globally."
                echo "You can directly use the command $appName, instead of the script file."

            ;;

            start)
                #Start the service
                sudo systemctl daemon-reload
                sudo systemctl enable $appName
                sudo systemctl restart $appName
                echo "Service (re)started."

            ;;

            log)
                #Retrieving logs for the service
                journalctl -a -u $appName -n 500 -f

            ;;


            stop)
                # Stop the service
                sudo systemctl stop $appName.service
                
            ;;

            disable)
                # Disables the service
                sudo systemctl disable $appName.service
            ;;

            *)
                # Wrong command
                echo "Please specify one of the options 'enable', 'start', 'log', 'disable', 'stop'."
                exit

        esac
    ;;

    update)
        put_env_variables

        # Backup the TLS certificate, CA certificate, and key
        paths=($TLS_CERT $TLS_KEY $TLS_CA)

        for value in ${paths[@]}
        do
            sudo cp "$value" "$value.tmp"
        done

        git pull --recurse-submodule
        git submodule foreach --recursive 'git checkout main && git pull'
        enable_command

        # Copy back the old TLS certificate, CA certificate, and key
        
        for value in ${paths[@]}
        do
            sudo mv "$value.tmp" "$value"
        done


        echo "Code updated, and TLS certificates, and keys maintained."


        exit
    ;;

    *)
        echo -e "Unknown option: $1
Possible options are: run, update, service, cert"
        exit
    ;;

    
esac