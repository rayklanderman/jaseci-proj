#!/bin/bash
# Start script for Render deployment
export PYTHONPATH="${PYTHONPATH}:/opt/render/project/src/backend/python"
cd /opt/render/project/src/backend
jac serve main.jac --host 0.0.0.0 --port $PORT