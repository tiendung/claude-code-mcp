# Members

> Learn about team roles, member management, SSO, usage controls, and billing for organizational teams

import { Accordion, AccordionGroup } from "@/components/Accordion";

## Roles

Teams have access to three user roles to help manage teams. Each role has specific permissions and billing implications.

<AccordionGroup>
  <Accordion title="Member (default)">
    * Access to all [Business features](https://cursor.com/pricing)
    * Can invite team members
    * Billed for a user seat
  </Accordion>

  <Accordion title="Admin">
    Admins have comprehensive control over team management and security settings to ensure smooth team operations.

    * Full team management capabilities:
      * Invite/remove team members
      * Modify team roles
    * Usage and security controls:
      * Toggle usage-based pricing
      * Configure SSO & domain verification
      * Set organization-wide spending caps
    * Access to admin dashboard
    * Billed for a user seat
  </Accordion>

  <Accordion title="Unpaid Admin">
    Unpaid Admins manage the team without using a paid seat - ideal for IT staff who don't need Cursor access.

    * Same capabilities as Admin
    * **Not billed for a user seat**
    * Requires at least one paid Admin on the team to assign this role
  </Accordion>
</AccordionGroup>

<div className="full-width-table">
  ### Comparison

  <Accordion title="Role Capabilities">
    | Capability             | Member | Admin | Unpaid Admin |
    | ---------------------- | :----: | :---: | :----------: |
    | Use Cursor features    |    ✓   |   ✓   |              |
    | Invite members         |    ✓   |   ✓   |       ✓      |
    | Remove members         |        |   ✓   |       ✓      |
    | Change user role       |        |   ✓   |       ✓      |
    | Admin dashboard        |        |   ✓   |       ✓      |
    | Configure SSO/Security |        |   ✓   |       ✓      |
    | Manage Billing         |        |   ✓   |       ✓      |
    | Set usage controls     |    ✓   |   ✓   |       ✓      |
    | Requires paid seat     |    ✓   |   ✓   |              |
  </Accordion>
</div>

## Managing members

All members in the team can invite other members. We currently do not have any way to control invites.

### Add member

#### Email invitation

* Click the `Invite Members` button
* Enter email addresses

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/account/invite-members.png" style={{ padding: `32px 64px`, backgroundColor: "#0c0c0c" }} />
</Frame>

#### Invite link

* Click the `Invite Members` button
* Copy the `Invite Link`
* Share with team members

<Info>
  Invite links do not expire and anyone who gets access to the link can join a
  team. You can prevent this by setting up [SSO](/account/teams/sso)
</Info>

### Remove member

Admins can remove members at any time by clicking the context menu and then "Remove". We'll only charge for time the member was in the team

### Change role

Admins can change roles for other members by clicking the context menu and then "Change role". There has to be at least one Admin per team

## Security & SSO

SAML 2.0 Single Sign-On (SSO) is available on Business and Enterprise plans. Key features:

* Configure SSO connections ([learn more about SSO setup](/account/teams/sso))
* Set up domain verification
* Automatic user enrollment through SSO
* SSO enforcement options
* Identity provider integration (Okta, etc)

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/account/sso-settings.png" style={{ padding: `32px 64px`, backgroundColor: "#0c0c0c" }} />
</Frame>

## Usage Controls

Access usage settings to:

* Enable usage-based pricing
* Enable for usage-based for premium models
* Set admin-only modifications for usage-based pricing settings
* Set monthly spending limits
* Monitor team-wide usage

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/account/usage-based-pricing.png" style={{ backgroundColor: "#0c0c0c" }} />
</Frame>

## Billing

When adding new team members:

* Each new member or admin adds a billable seat (see [pricing](https://cursor.com/pricing))
* Seat changes are prorated for your billing period
* Unpaid admin seats are not counted

Adding new team members in the middle of a month, we'll only charge you for the days they actually use. Similarly, if someone leaves the team, we'll credit your account for any unused days.

If you change someone's role (e.g from Admin to Unpaid Admin), we'll automatically adjust the billing from the day of the change. You can choose to be billed either monthly or yearly - both options are available to suit your needs.

### Switching from monthly to yearly billing

You can save 20% of the Business plan by switching from monthly to yearly billing. This can be done from the [dashboard](/account/dashboard)

1. Go to [settings](https://cursor.com/settings)
2. In the account section, click on "Advanced" then "Upgrade to yearly billing"

<Frame>
  <img src="https://mintlify.s3.us-west-1.amazonaws.com/cursor/images/plans/business/upgrade-to-yearly.png" />
</Frame>

<Note>
  Please note that you can only switch from monthly to yearly billing
  self-service. To switch from yearly to monthly billing, please contact us at
  [hi@cursor.com](mailto:hi@cursor.com).
</Note>
