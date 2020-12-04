/* global Slick $ */

  var columns = [
    {id: "countryName", name: "Country Name", field: "Country Name"},
    {id: "countryCode", name: "Country Code", field: "Country Code"},
    {id: "le1960", name: "LE - 1960", field: "LE - 1960"},
    {id: "le2015", name: "LE - 2015", field: "LE - 2015"},
    {id: "region", name: "Region", field: "Region"},
    {id: "incomegroup", name: "Income Group", field: "IncomeGroup"}
  ];
  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false
  };
  
  function displayGrid(data){
    new Slick.Grid("#myGrid", data, columns, options);
  }
  
  $.ajax({
      type: "GET",
      url: "life-expectancy.csv",
      success: function (csvstring) {
        let rows = csvstring.split("\r\n");
        let data = [];
        let headers = rows[0].split(",");
        for(let i = 1; i < rows.length; i++){
          data[i-1] = {};
          let row = rows[i].split(",");
          for(let j = 0; j < headers.length; j++){
             data[i-1][headers[j]] = row[j];
          }
         
        }
        displayGrid(data); 
      },
      error: function(xhr, ajaxOptions, thrownError) {
            alert("Status: " + xhr.status + "     Error: " + thrownError);
        }
  });