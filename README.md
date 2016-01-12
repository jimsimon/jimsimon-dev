# Creating ssl certificates
Create the key
```openssl req -new -newkey rsa:2048 -nodes -keyout certificate/localhost.key -out certificate/localhost.csr```

Then create the certificate
```openssl x509 -req -days 365 -in certificate/localhost.csr -signkey certificate/localhost.key -out certificate/localhost.crt```