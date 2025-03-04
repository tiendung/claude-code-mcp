# SSO

> Learn how to set up SAML 2.0 Single Sign-On (SSO) for secure team authentication in Cursor

## Overview

SAML 2.0 Single Sign-On (SSO) is available on the Cursor Business plan. This guide walks through the configuration process and helps you set up secure authentication for your team.

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/account/sso-settings.png" style={{ padding: 32, backgroundColor: "#0c0c0c" }} />
</Frame>

## Prerequisites

* A Cursor Business plan
* Admin access to your identity provider (e.g., Okta)
* Admin access to your Cursor organization

## Configuration Steps

1. Sign in to your Cursor account and navigate to [cursor.com/settings](http://cursor.com/settings)
2. Locate the "Configure SSO" button in the bottom left of the settings page
3. Click the button to begin the SSO setup process
4. In your identity provider (e.g., Okta):
   * Create a new SAML application
   * Configure the SAML settings using the information provided in Cursor
   * Set up Just-in-Time (JIT) provisioning for seamless user access

### Identity Provider Setup Guides

For detailed setup instructions specific to your identity provider, refer to the [WorkOS integration guides](https://workos.com/docs/integrations).

<Info>SCIM provisioning coming H1 2025</Info>

## Additional Settings

* SSO enforcement is managed through the admin dashboard
* New users are automatically enrolled in your organization when they sign in through SSO
* User management can be handled directly through your identity provider

## Troubleshooting

If you encounter issues during setup:

* Verify your domain has been verified in Cursor
* Ensure all required SAML attributes are properly mapped
* Check that the SSO configuration is enabled in your admin dashboard
* If a user is unable to authenticate, ensure the first and last name set in the identity provider matches their name in Cursor
