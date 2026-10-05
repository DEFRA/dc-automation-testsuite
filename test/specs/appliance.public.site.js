import applianceSearchPage from '../page-objects/publicSite/appliance.search.page.js'

describe('Verify the Search Appliance List', function () {
  /* it('Navigation to Guidance page for smoke control from Appliance Search',async ()=>{

        browser.url('https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/');
        //console.log(await applianceSearchPage.appliancePageHeader.getText());
        //console.log("testing");
        await applianceSearchPage.guidancePageLink.click();
        browser.pause(5000);
    
        
    })

   it('Navigation to Fuels list page from Appliance Search',async ()=>{

        browser.url('https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/')
        await $('a[href*="fuels"]').click();
        
    })

    it('Navigation to DEFRA link',async ()=>{

        browser.url('https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/')
        await $('a[href*="department-for-environment-food-rural-affairs"]').click();

        })

    it('Verify that Appliance search page is showing 25 results at a time',async()=>{
        browser.url('https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/');
        //const parentElement = await $('=.govuk-grid-column-two-thirds');
        //const textCount= await $("//strong[text()='Showing  1 to 25 of 101 records']");
        const textCount= await $("//p[@class='govuk-body']");
        //await $('a[href*="smoke-control-area-rules"]').click();
        const noOfAppliances = (await $$("//div[@class='govuk-!-margin-bottom-1']")).length;
        
        console.log("noOfAppliances");
        console.log(noOfAppliances);
        
    })

    it("GDS standards of Pagination appliance search page", async()=>{

        browser.url('https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/');
        const paginationElement = await $('aria/pagination');
       if (await applianceSearchPage.nextPaginationLink.isDisplayed()){
            console.log('Next Page link exists and is visible');
            applianceSearchPage.nextPaginationLink.click();
        }
        
        
      if (await applianceSearchPage.previousPaginationLink.isDisplayed()){
            applianceSearchPage.previousPaginationLink.click();
            console.log('Next Page link exists and is visible');
        }

    }) */

  it('Verify Search Appliance Functionality', async () => {
    browser.url(
      'https://aqie-dc-frontend.test.cdp-int.defra.cloud/finder/appliances/'
    )
    await applianceSearchPage.searchInput.setValue('Model')
    await applianceSearchPage.searchButton.click()
  })
})
