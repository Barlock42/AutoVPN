#!/bin/bash

# Read the config file
source autoCert.cfg

# Set the path to the Easy-RSA directory
EASY_RSA_DIR="/home/ubuntu/easy-rsa"

# Set the path to the OpenVPN client configuration directory
CLIENT_CONFIG_DIR="/home/ubuntu/client-configs"

# Set the default values for the client configuration options
PROTOCOL="udp"
PORT="1194"
DNS_SERVERS="8.8.8.8,8.8.4.4"
COMP_LZO="yes"

# Check that the script is being run as root
if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

# Check that the required directories exist
if [ ! -d "$EASY_RSA_DIR" ] || [ ! -d "$CLIENT_CONFIG_DIR" ]
  then echo "Required directories not found"
  exit
fi

# Check if client name already passed
if [ $# -eq 0 ]; then
  # Ask the user for the new client name
  read -p "Enter a name for the new client: " CLIENT_NAME
else
  CLIENT_NAME=$1
fi

# Generate a new key pair and certificate for the new client
cd $EASY_RSA_DIR
echo -ne '\n' | ./easyrsa gen-req $CLIENT_NAME nopass
cp pki/private/${CLIENT_NAME}.key /home/ubuntu/client-configs/keys/

# Signing the OpenVPN Server’s Certificate Request

#echo "/home/ubuntu/easy-rsa/pki/reqs/${CLIENT_NAME}.req" "${CERT_AUTH_IP}:/tmp/";
# Copy the certificate request to the Certificate Authority
if ! scp -i CertificateAuthority.pem "/home/ubuntu/easy-rsa/pki/reqs/${CLIENT_NAME}.req" "${CERT_AUTH_IP}:/tmp/"; then
  echo "Failed to copy certificate request to Certificate Authority"
  exit 1
fi

#echo "$CERT_AUTH_IP" "${EASY_RSA_DIR}/easyrsa import-req /tmp/${CLIENT_NAME}.req ${CLIENT_NAME}";
# Import the certificate request into the Easy-RSA directory on the Certificate Authority
if ! ssh -i CertificateAuthority.pem "$CERT_AUTH_IP" "cd ${EASY_RSA_DIR} && ./easyrsa import-req /tmp/${CLIENT_NAME}.req ${CLIENT_NAME}"; then
  echo "Failed to import certificate request on Certificate Authority"
  exit 1
fi

# Sign the certificate request on the Certificate Authority
if ! ssh -i CertificateAuthority.pem "$CERT_AUTH_IP" "cd ${EASY_RSA_DIR} && ./easyrsa sign-req client ${CLIENT_NAME}"; then
  echo "Failed to sign certificate request on Certificate Authority"
  exit 1
fi

# Copy the signed certificate back to the client
if ! scp -i CertificateAuthority.pem "${CERT_AUTH_IP}:${EASY_RSA_DIR}/pki/issued/${CLIENT_NAME}.crt" "/home/ubuntu/client-configs/keys/"; then
  echo "Failed to copy signed certificate back to client"
  exit 1
fi

# Create a new client configuration file
cd $CLIENT_CONFIG_DIR
./make_config.sh $CLIENT_NAME

echo "New client $CLIENT_NAME created"