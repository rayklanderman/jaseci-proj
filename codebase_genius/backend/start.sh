#!/bin/bash
# Start script for Render deployment
export PYTHONPATH="${PYTHONPATH}:python"
cd /opt/render/project/src
jac serve main.jac --host 0.0.0.0 --port $PORT