/* global Slick $ */

 var grid;
var data = []
var columns = [
  { id: "title", name: "Title", field: "title", width: 240, sortable: true },
  { id: "c1", name: "Sort 1", field: "c1", width: 240, sortable: true },
  { id: "c2", name: "Sort 2", field: "c2", width: 240, sortable: true },
  { id: "c3", name: "Sort 3", field: "c3", width: 240, sortable: true }
];
var options = {
  enableCellNavigation: false,
  enableColumnReorder: false
};
var numberOfItems = 25000;
var items = [];
var indices;
var isAsc = true;
var currentSortCol = { id: "title" };
var i;
// Copies and shuffles the specified array and returns a new shuffled array.
function randomize(items) {
  var randomItems = $.extend(true, null, items), randomIndex, temp, index;
  for (index = items.length; index-- > 0;) {
    randomIndex = Math.round(Math.random() * items.length - 1);
    if (randomIndex > -1) {
      temp = randomItems[randomIndex];
      randomItems[randomIndex] = randomItems[index];
      randomItems[index] = temp;
    }
  }
  return randomItems;
}
/// Build the items and indices.
for (i = numberOfItems; i-- > 0;) {
  items[i] = i;
  data[i] = {
    title: "Task ".concat(i + 1)
  };
}
indices = { title: items, c1: randomize(items), c2: randomize(items), c3: randomize(items) };
// Assign values to the data.
for (i = numberOfItems; i-- > 0;) {
  data[indices.c1[i]].c1 = "Value ".concat(i + 1);
  data[indices.c2[i]].c2 = "Value ".concat(i + 1);
  data[indices.c3[i]].c3 = "Value ".concat(i + 1);
}
// Define function used to get the data and sort it.
function getItem(index) {
  return isAsc ? data[indices[currentSortCol.id][index]] : data[indices[currentSortCol.id][(data.length - 1) - index]];
}
function getLength() {
  return data.length;
}
grid = new Slick.Grid("#myGrid", {getLength: getLength, getItem: getItem}, columns, options);
grid.onSort.subscribe(function (e, args) {
  currentSortCol = args.sortCol;
  isAsc = args.sortAsc;
  grid.invalidateAllRows();
  grid.render();
});