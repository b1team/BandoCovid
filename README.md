# BandoCovid


# API

## INSTALLING

```sh
pip3 install -r requirements.txt
cp .env-example > .env
```

## RUNNING

```sh
gunicorn api.main:app
```