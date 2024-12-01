const { parse } = require('json2csv');
const fs = require('fs');
const data = require('./data.json');

const fetchListingsAndCreateCSV = async (address, pageSize) => {
  try {
    const payload = {...data.body};
    payload.variables.input.location.searchString = address;
    payload.variables.input.pagination.rowsPerPage = parseInt(pageSize);
    
    const response = await fetch(data.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const responseData = await response.json();
    //   console.log(responseData);
      const listings = responseData.data.searchQueries.search.results;
    //   console.log("Listings>>>>>>>>>>",listings);

      const csvData = listings.map(listing => ({
        'Listing ID': listing?.basicPropertyData?.id || '-',
        'Listing Title': listing?.displayName?.text || '-',
        'Page Name': listing?.basicPropertyData?.pageName || '-',
        'Amount Per Stay': listing?.priceDisplayInfoIrene?.priceBeforeDiscount?.displayPrice?.amountPerStay?.amount || '-',
      }));

      // Convert the data to CSV format
      const csv = parse(csvData);

      // Write the CSV data to a file
      fs.writeFileSync('listings.csv', csv);
      console.log('CSV file has been created: listings.csv');
    } else {
      console.error('Error fetching data:', response.statusText);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

const address = process.argv[2];
const pageSize = process.argv[3];
// console.log("Address>>>>>>>",address);
// console.log("Page Size>>>>>>>", pageSize)


if (!address || !pageSize) {
  console.error('Please provide both address and page size as arguments.');
  process.exit(1);
}

// Call the function to fetch listings and create a CSV
fetchListingsAndCreateCSV(address, pageSize);
