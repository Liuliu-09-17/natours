class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) Filtering
    const queryObject = { ...this.queryString }; // make a new object
    const excludeFields = ['page', 'sort', 'limit', 'fileds'];
    excludeFields.forEach((el) => delete queryObject[el]); //loop
    // console.log(req.query, queryObject);
    //1B) Advance filtering
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // console.log(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Tour.find(JSON.parse(queryStr)); // let = normal varable
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.query = this.query.sort(sortBy); //自动升序，要降序加（-） -price
      // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('-createdAt'); // default
    }
    return this;
  }

  limitFields() {
    // ???????????
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1; // default page 1
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10, 1-10, page 1, 11-20, page 2, 21-30, page 3
    // query = query.skip(20).limit(10);
    this.query = this.query.skip(skip).limit(limit);
    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours) throw new Error('This page does not exit.');
    // }
    return this;
  }
}
module.exports = APIFeatures;
