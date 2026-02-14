# manadia

manadia is an open source location tracker application using owntracks, another open source application, as the location service provider. manadia aims to provide a customizable approach to location tracking and consumption of the location data.

_readme.md last updated 14 february 2025_

---

## limitations (arranged by severity)

### security
generated api keys are stored unhashed in the project folder. the severity of this depends on how you host the application. this is being actively addressed.  

some credentials also exist in the docker config file unencrypted. this is similarly being addressed actively.

### battery consumption
depending on the mode selected in owntracks, battery consumption varies anywhere from 2–30% over a normal day.

### documentation
there is no publicly available documentation for manadia as of today.

### ui
as of now, manadia does not have a client interface that is accessible.

### multi user support
manadia currently does not natively support onboarding more than 1 user. it is possible, but not documented at this point.

---

## hosting prerequisites

1. docker and docker compose  
2. a vps or local server running on your machine  
3. domain name for ssl certificates via caddy (preferred but not necessary)  
4. ssh access to your server  

---

## hosting quick guide

1. clone the repo  
2. create a `.env` with secure password:  DB_PASSWORD=somepassword
3. update the domain and password hash in `Caddyfile`
4. start services : docker compose pull , docker compose up -d
5. verify deployment : docker ps

---

## owntracks configuration

1.  host - yourdomain.com
2.  port - 443
3.  proto - http
4.  tls - on
5.  userid - owntracks (configurable)
6.  password - yourpassword
7.  authentication - on

---

## development quick guide

coming soon.
