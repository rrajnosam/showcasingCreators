const paginate = (req, res, next) => {
    // console.log(req)
    let page = parseInt(req.query.page)
    // const limit = parseInt(req.query.limit)
    let limit = 5
    const baseUrl = req.baseUrl + req._parsedUrl.pathname

    let startIndex = (page - 1) * limit
    let endIndex = page * limit

    if (isNaN(page)) {
        page = 1
    }
    if (isNaN(startIndex)) {
        startIndex = 0
    }
    if (isNaN(endIndex)) {
        endIndex = limit
    }

    // console.log("paginate")
    // console.log(page, limit, startIndex, endIndex)
    res.paginate = ({
        page: page,
        limit: limit,
        startIndex: startIndex,
        endIndex: endIndex,
        previousPage: 1,
        nextPage: 2,
        numberOfPages: 1,
        baseUrl: baseUrl
    })

    next()
}


module.exports = paginate;
