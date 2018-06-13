module.exports = async (browser, url) => {
    const { AWS_ACCOUNT, IAM_USERNAME, IAM_PASSWORD } = process.env;
    const page = await browser.newPage();

    // AWS account id or alias page
    await page.goto(url);
    await page.waitForSelector('#resolver_container #resolving_input');
    await page.type('#resolver_container #resolving_input', AWS_ACCOUNT);
    await page.click('b.awsui-text-normal');
    await page.click('button#next_button');

    // IAM account login page
    await page.waitForSelector('#accountFields #username');
    await page.type('#accountFields #username', IAM_USERNAME);
    document.querySelector('#accountFields label');
    await page.type('#accountFields #password', IAM_PASSWORD);
    document.querySelector('#accountFields label');
    await page.click('a#signin_button');

    await page.setViewport({ height: 768, width: 1200 });

    return page;
};
