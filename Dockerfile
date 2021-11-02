FROM  python:3.9.7-slim
WORKDIR /app
COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt
ENV PYTHONPATH=/app
COPY . .