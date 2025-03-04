# Common Issues

> Guide for troubleshooting common Cursor app issues including updates, login, and connectivity problems

## Network Issues

If you're experiencing connectivity issues with Cursor, here are some steps to troubleshoot:

Common symptoms of network issues include:

* Codebase indexing failing with errors
* Agent showing connection errors
* Tab autocomplete not working
* Chat or other AI features failing to respond

Here are the steps to troubleshoot:

1. Check your internet connection
2. Verify if you're behind a corporate proxy or VPN
3. Test if HTTP/2 is accessible by running:
   ```bash
   curl -I --http2 -v https://api2.cursor.sh
   ```
   If you see the following response, it indicates HTTP/2 is not properly negotiated:
   ```
   * ALPN: server did not agree on a protocol. Uses default.
   * using HTTP/1.x
   ```

#### ZScaler

If you're using ZScaler and experiencing connectivity issues, here are your options:

1. Configure the ZScaler proxy to properly support HTTP/2 ALPN negotiation
2. Allowlist the cursor.sh domain to bypass the ZScaler inspection

The following domains need to be accessible:

* `api2.cursor.sh`: Used for most API requests
* `api3.cursor.sh`: Used for Cursor Tab requests (HTTP/2 only)
* `repo42.cursor.sh`: Used for codebase indexing (HTTP/2 only)
* `api4.cursor.sh`, `us-asia.gcpp.cursor.sh`, `us-eu.gcpp.cursor.sh`, `us-only.gcpp.cursor.sh`: Used for Cursor Tab requests depending on your location (HTTP/2 only)
* `marketplace.cursorapi.com`, `cursor-cdn.com`: Used for downloading extensions from the extension marketplace
* `download.todesktop.com`: Used for checking for and downloading updates

To verify if ZScaler is causing the issue, try temporarily disconnecting from ZScaler and test if Cursor's functionality is restored.

## Resource Usage Issues

If you're experiencing high CPU or RAM usage in Cursor, here are steps to diagnose and resolve the issue:

1. Check enabled extensions
   * Some extensions can significantly impact performance
   * Disable extensions one by one to identify problematic ones
   * Consider removing unused extensions

2. Use Process Explorer
   * Open the Command Palette (`Cmd/Ctrl + Shift + P`)
   * Type "Developer: Open Process Explorer"
   * Monitor which processes are consuming resources
   * Look for any processes using excessive CPU or memory

3. Monitor system resources
   * Check if the issue is Cursor-specific or system-wide
   * Consider closing other resource-intensive applications
   * Ensure your system meets the minimum requirements

4. Test with minimal extensions
   * Start Cursor with extensions disabled
   * If performance improves, gradually re-enable extensions
   * This helps identify which extensions may be causing issues

When reporting resource usage issues, screenshots of the Process Explorer and your system's resource monitor can be extremely helpful in diagnosing the problem.

## Other

#### I see an update on the changelog but Cursor won't update.

If the update is very new, it might not have rolled out to you yet. We do staged rollouts, which means we release new updates to a few randomly selected users first before releasing them to everyone. Expect to get the update in a couple days!

#### I have issues with my GitHub login in Cursor / How do I log out of GitHub in Cursor?

You can try using the `Sign Out of GitHub` command from the command palette `Ctrl/⌘ + Shift + P`.

#### I can't use GitHub Codespaces.

Unfortunately, we don't support GitHub Codespaces yet.

#### I have errors connecting to Remote SSH.

Currently, we don't support SSHing into Mac or Windows machines. If you're not using a Mac or Windows machine, please report your issue to us in the [forum](https://forum.cursor.com/). It would be helpful to include some logs for better assistance.

#### SSH Connection Problems on Windows

If you encounter the error "SSH is only supported in Microsoft versions of VS Code", follow these steps:

1. Uninstall the current Remote-SSH extension:
   * Open the Extensions view (`Ctrl + Shift + X`)
   * Search for "Remote-SSH"
   * Click on the gear icon and select "Uninstall"

2. Install version 0.113 of Remote-SSH:
   * Go to the Cursor marketplace
   * Search for "Remote-SSH"
   * Find version 0.113 and install it

3. After installation:
   * Close all VS Code instances that have active SSH connections
   * Restart Cursor completely
   * Try connecting via SSH again

If you still experience issues, make sure your SSH configuration is correct and that you have the necessary SSH keys set up properly.

#### Cursor Tab and Cmd K do not work behind my corporate proxy.

Cursor Tab and Cmd K use HTTP/2 by default, which allows us to use less resources with lower latency. Some corporate proxies (e.g. Zscaler in certain configurations) block HTTP/2. To fix this, you can set `"cursor.general.disableHttp2": true` in the settings (`Cmd/Ctrl + ,` and then search for `http2`).

#### I just subscribed to Pro but I'm still on the free plan in the app.

Try logging out and logging back in from the Cursor Settings

#### When will my usage reset again?

If you're subscribed to Pro you can click on `Manage Subscription` from the [Dashboard](https://cursor.com/settings) and your plan renewal date will be displayed at the top.

If you're a free user you can check when you got the first email from us in your inbox. Your usage will reset every month from that date.

#### My Chat/Composer history disappeared after an update

If you notice that your Chat or Composer history has been cleared following an update, this is likely due to low disk space on your system. Cursor may need to clear historical data during updates when disk space is limited. To prevent this from happening:

1. Ensure you have sufficient free disk space before updating
2. Regularly clean up unnecessary files on your system
3. Consider backing up important conversations before updating

#### How do I uninstall Cursor?

You can follow [this guide](https://code.visualstudio.com/docs/setup/uninstall) to uninstall Cursor. Replace every occurrence of "VS Code" or "Code" with "Cursor", and ".vscode" with ".cursor".

#### How do I delete my account?

You can delete your account by clicking on the `Delete Account` button in the [Dashboard](https://cursor.com/settings). Note that this will delete your account and all data associated with it.

#### How do I open Cursor from the command line?

You can open Cursor from the command line by running `cursor` in your terminal. If you're missing the `cursor` command, you can

1. Open the command palette `⌘⇧P`
2. Type `install command`
3. Select `Install 'cursor' command` (and optionally the `code` command too which will override VS Code's `code` command)

#### Unable to Sign In to Cursor

If you click Sign In on the General tab of Cursor's Settings tab but are redirected to cursor.com and then return to Cursor still seeing the Sign In button, try disabling your firewall or antivirus software, which may be blocking the sign-in process.
