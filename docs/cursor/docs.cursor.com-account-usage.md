# Usage

> Learn how Cursor handles fast and slow request pools, pricing, and monthly request allocation

### Fast and Slow Requests

There are two types of requests in Cursor, **slow** and **fast** that has its own pool

By default, Cursor servers try to give all users fast `premium` model requests. However, when users run out of fast `premium` credits, they are moved to a slow pool. Wait times in the slow pool are calculated proportionally to how many slow requests you've used, so they generally remain manageable unless you're well over your fast request limit.

To bypass wait times entirely, you cana enable usage-based pricing (you'll only be charged for requests beyond your included fast requests)

See [models](/settings/models) for an overview of which models are `premium` and their alternatives

### Included requests

Every subscription includes a set amount of fast requests. See [plans](/account/plans.mdx) for details on how many fast requests your subscription includes.

### Additional requests

We offer usage-based pricing for additional requests beyond your plan's included quota:

#### Usage-based Pricing

You may opt in to usage-based pricing for requests that go beyond what is included in your Pro or Business plan from your [dashboard](/account/dashboard)

<Info>Usage-based pricing is only available with a paid subscription.</Info>

From the dashboard, you can toggle usage based pricing for `premium` models and `other` models (see [models](/settings/models) to understand which model is which). You can also configure a spend limit in USD to make sure you never go over that. Once the spending limit is hit, slow requests will be used.

We will bill for additional fast requests when you’ve made requests totaling \$20, **or** on the 2nd or 3rd day of the month, whichever comes first.

<AccordionGroup>
  <Accordion title="Single invoice">
    375 fast requests made with a `premium` model (\$15) will be billed at the beginning of the next month since the total value is under \$20
  </Accordion>

  <Accordion title="Multiple invoices">
    <p>
      1150 fast requests made with a `premium` (\$46) will be billed 3 times:
    </p>

    <p>1. When first batch of 500 requests has been made (\$20)</p>
    <p>2. When second batch of 500 requests has been made (also \$20)</p>
    <p>3. Beginning of next month (remaining \$6)</p>
  </Accordion>
</AccordionGroup>

For team accounts, administrators can restrict usage-based pricing settings to admin-only access

Cost per request for each model can be found on the [models](/settings/models) page

#### Fast requests packages (deprecated)

Fast requests packages have been deprecated. Existing users with additional packages can continue to use them and have the option to remove them, but new packages cannot be purchased. If you are at the base amount of fast requests packages, the option to modify them will no longer be available in the dashboard.

### FAQ

#### When do my fast requests reset?

Your Fast Requests reset on a fixed monthly date based on when you first set up your plan. If you purchase additional requests (for example, upgrading from 500 to 1000 requests), the reset date remains unchanged. For instance, if your plan started on the 23rd, your requests will always reset on the 23rd of each month, regardless of when you purchase additional requests.

#### What does "500 premium requests" mean for teams?

Each user gets their own quota of 500 fast requests for premium models per month. These requests are not pooled across the team - every team member gets their own fresh 500 requests when their personal monthly cycle resets.
