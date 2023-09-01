
const paginate = (req, arr) => {
  let totalCount = arr.length;
  let pageSize = 10;
  if (req.query.pageSize) {
    if (req.query.pageSize < 1 || req.query.pageSize > 100) {
      pageSize = 10;
    } else {
      pageSize = parseInt(req.query.pageSize);
    }
  }
  console.log('pageSize=', pageSize);

  let pageNumber = 1;
  let totalPages = parseInt(arr.length / pageSize);
  if (parseInt(arr.length % pageSize)) {
    totalPages += 1;
  }
  console.log('totalPages=', totalPages);

  if (req.query.pageNumber) {
    if (req.query.pageNumber >= 1 && req.query.pageNumber <= totalPages) {
      pageNumber = parseInt(req.query.pageNumber);
    }
  }

  let out = [];
  //console.log(routes);
  for (let i = (pageNumber - 1) * pageSize; i < arr.length && i < pageNumber * pageSize; i++) {
    out.push(arr[i]);
  }
  //console.log(out);

  let url = req.url;

  let previousPageLink = null;
  if (pageNumber > 1) {
    previousPageLink = url + `?pageNumber=${pageNumber - 1}&pageSize=${pageSize}`;
    if (req.query.keyword) {
      previousPageLink += "&keyword=" + req.query.keyword;
    }
  }

  let nextPageLink = null;
  if (pageNumber < totalPages) {
    nextPageLink = url + `?pageNumber=${pageNumber + 1}&pageSize=${pageSize}`;
    if (req.query.keyword) {
      nextPageLink += "&keyword=" + req.query.keyword;
    }
  }

  let pagination = {
    "previousPageLink": previousPageLink,
    "nextPageLink": nextPageLink,
    "totalCount": totalCount,
    "pageSize": pageSize,
    "currentPage": pageNumber,
    "totalPages": totalPages
  };

  return {
    pagination: pagination,
    data: out,
  };
}

module.exports = paginate;
