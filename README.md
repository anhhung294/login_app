# login_app
Create src/config/oauthCred.json:
```
{
    "google": {
        "client_id":"",
        "client_secret":""
    },"facebook":{
        "client_id":"",
        "client_secret":""
    },"discord":{
        "client_id":"",
        "client_secret":""
    }
}
```
Create environment variables:
COOKIE_SECRET
DOMAIN

# Start
```
docker compose up -d
```