RedBirdHacks-2016
=================

Setup
-----

Set up a virtual Python environment for this project.

```bash
virtualenv venv
source venv/bin/activate
```

Then install all the Python dependencies.

```bash
pip install -r requirements.txt
```

Now you're ready to start the web server.

```bash
gunicorn -c gunicorn_config.py main:app
```

The server will start at [http://localhost:8000/](http://localhost:8000/).
