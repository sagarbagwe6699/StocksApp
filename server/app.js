const express = require('express')
const https = require('https')


const app = express()
const api_key = 'c83enmqad3ift3bm88a0'
const base_url = 'https://finnhub.io/api/v1/'
const token = `token=${api_key}`

// Autocomplete
app.get(`/autocomplete/:query?`, (req, resp) => {
    if(!req.params){
        resp.send([])
    }
    https.get(`${base_url}search?q=${req.params.query}&${token}`, (res) => {
        let response = ''
        res.on('data', (r) => {
            response = response + r
        })
        res.on('end', () => {
            response = JSON.parse(response)
            var temp = []
            for(let obj of response["result"]){
                if(obj["type"] === "Common Stock" && !obj["symbol"].includes('.')){
                    temp.push(obj)
                }
            }
            resp.send(temp)
        })
    }).on('error', (err) => {
        console.log("Error: " + err.message)
    })
})

// Company
app.get(`/company/:ticker`, (req, resp) => {
    // Holds the combined response
    let detailsResponse = {}

    // Get company information
    https.get(`${base_url}stock/profile2?symbol=${req.params.ticker}&${token}`, (res) => {
        let response = ''
        res.on('data', (r) => {
            response = response + r
        })
        res.on('end', () => {
            response = JSON.parse(response)
            detailsResponse["company"] = response
            // Get company summary
            https.get(`${base_url}quote?symbol=${req.params.ticker.toUpperCase()}&${token}`, (res) => {
                let response = ''
                res.on('data', (r) => {
                    response = response + r
                })
                res.on('end', () => {
                    response = JSON.parse(response)
                    detailsResponse["summary"] = response
                    https.get(`${base_url}stock/peers?symbol=${req.params.ticker.toUpperCase()}&${token}`, (res_peers) => {
                        let response_peers = ''
                        res_peers.on('data', (rp) => {
                            response_peers = response_peers + rp
                        })
                        res_peers.on('end', () => {
                            response_peers = JSON.parse(response_peers)
                            detailsResponse["peers"] = response_peers
                            resp.send(detailsResponse)
                        })
                    })
                })
            }).on('error', (err) => {
                console.log("Error: " + err.message)
            })
            // -*-*-*-*-*-*-*-*
        })
    }).on('error', (err) => {
        console.log("Error: " + err.message)
    })
})

// News
app.get(`/news/:ticker`, (req, resp) => {
    console.log('getting news...')
    let to_date = new Date()
    let from_date = new Date()
    from_date.setMonth(from_date.getMonth() - 6)
    from_date.setDate(from_date.getDate() - 1)
    from_date = from_date.toISOString().split('T')[0]
    to_date = to_date.toISOString().split('T')[0]

    https.get(`${base_url}/company-news?symbol=${req.params.ticker}&from=${from_date}&to=${to_date}&${token}`, (res) => {
        let response = ''
        let top_five = []
        let count = 0
        res.on('data', (r) => {
            response = response + r
        })
        res.on('end', () => {
            response = JSON.parse(response)
            for(let obj of response){
                if(count == 5){
                    break
                }
                if(obj["headline"] !== "" && obj["image"] !== ""){
                    top_five.push(obj)
                    count = count + 1
                }
            }
            resp.send(top_five)
        })
    }).on('error', (err) => {
        console.log("Error: " + err.message)
    })
})

app.get(`/insights/:ticker`, (req, resp) => {
    https.get(`${base_url}stock/social-sentiment?symbol=${req.params.ticker}&${token}`, (res) => {
        let response = ''
        res.on('data', (r) => {
            response = response + r
        })
        res.on('end', () => {
            response = JSON.parse(response)
            rp = 0
            rn = 0
            tp = 0
            tn = 0
            for(r of response["reddit"]){
                if(r["positiveMention"] === 1){
                    rp = rp + 1
                }
                else if(r["negativeMention"] === 1){
                    rn = rn + 1
                }
            }
            for(t of response["twitter"]){
                if(t["positiveMention"] === 1){
                    tp = tp + 1
                }
                else if(t["negativeMention"] === 1){
                    tn = tn + 1
                }
            }
            resp.send({
                "ticker": req.params.ticker,
                "reddit": {
                    "Total": rp + rn,
                    "Positive": rp,
                    "Negative": rn
                },
                "twitter": {
                    "Total": tp + tn,
                    "Positive": tp,
                    "Negative": tn
                }
            })
        })
    })
})

// Charts
app.get(`/charts/:ticker`, (req, resp) => {
    let to_date = new Date()
    let from_date = new Date()
    from_date.setHours(from_date.getHours() - 6)
    // from_date.setDate(from_date.getDate() - 1)
    console.log(to_date)
    console.log(from_date)
    from_date = parseInt(Math.floor(from_date.getTime()) / 1000)
    to_date = parseInt(Math.floor(to_date.getTime()) / 1000)
    console.log(`${base_url}stock/candle?symbol=${req.params.ticker.toUpperCase()}&resolution=5&from=${from_date}&to=${to_date}&${token}`)

    https.get(`${base_url}stock/candle?symbol=${req.params.ticker.toUpperCase()}&resolution=5&from=${from_date}&to=${to_date}&${token}`, (res) => {
        let response = ''
        let top_five = []
        let count = 0
        res.on('data', (r) => {
            response = response + r
        })
        res.on('end', () => {
            response = JSON.parse(response)
            resp.send(response)
        })
    }).on('error', (err) => {
        console.log("Error: " + err.message)
    })
})

app.listen(3000, () => console.log('Listening on port 3000'))