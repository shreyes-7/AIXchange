c = get_config()

# Network and Port
c.ServerApp.ip = "127.0.0.1"
c.ServerApp.port = 8888

# Security & Authentication
c.ServerApp.token = "aixchange_sandbox_token"
c.ServerApp.password = ""
c.ServerApp.open_browser = False
c.ServerApp.allow_remote_access = True
c.ServerApp.allow_origin = "*"
c.ServerApp.disable_check_xsrf = True

# Allow iframe embedding inside AIXchange frontend (http://localhost:5173)
c.ServerApp.tornado_settings = {
    "headers": {
        "Content-Security-Policy": "frame-ancestors 'self' http://localhost:5173 http://127.0.0.1:5173 *",
    }
}
