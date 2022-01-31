
# F5 Test REST service

This service is for mocking up all F5 rest endpoints needed to develop tools

## find and kill a process running on a port

<https://stackoverflow.com/questions/3855127/find-and-kill-process-locking-port-3000-on-mac>

```bash
lsof -t -i tcp:1234 | xargs kill
```

## example command to generate self-signed cert

```bash
  openssl req -x509 -nodes \
          -days 3650 \
          -newkey 2056 \
          -subj '/CN=f5MockService' \
          -keyout f5MockService.key \
          -out f5MockService.crt
```
