# Troubleshooting Guide

> Technical guide for gathering logs, errors and system info when reporting Cursor app issues

<Steps>
  <Step title="Screenshot of issue">
    Capture a screenshot of the issue, making sure to redact any sensitive
    information.
  </Step>

  <Step title="Steps to reproduce">
    Document the exact steps needed to reproduce the issue.
  </Step>

  <Step title="System Information">
    Retrieve system information from: `Cursor` > `Help` > `About`
  </Step>

  <Step title="VPN/Proxy Status">
    Note if you're using a VPN or proxy like Zscaler.
  </Step>

  <Step title="Console Errors">
    Check developer tools console errors: 1. Open developer tools via: `Cursor` >
    `Help` > `Toggle Developer Tools` 2. Click `Console` 3. Look for any related
    errors
  </Step>

  <Step title="Logs">
    Access logs through one of these methods:

    On Windows, find logs at:

    ```txt
    C:\Users\<your-user-name>\AppData\Roaming\Cursor\logs
    ```

    Or open logs folder via:

    * `Ctrl` + `Shift` + `P` (command palette)
    * Type and select `Developer: Open Logs Folder`

    Alternatively, view logs in:
    `Cursor` > `Terminal` > `Output` > select `Window` or other Cursor options
  </Step>

  <Step title="High CPU or RAM/Memory Usage">
    If you're experiencing performance issues with high resource usage:

    * Check number of enabled extensions
    * Disable non-essential extensions to identify problematic ones
    * Open Process Explorer (`Cmd/Ctrl` + `Shift` + `P` > "Developer: Open Process Explorer") and share a screenshot
    * Share a screenshot of your system's resource monitor (Activity Monitor on macOS, Task Manager on Windows, or System Monitor on Linux) showing Cursor's resource usage
    * Verify if issue persists with minimal extension setup
  </Step>
</Steps>
