const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()

const PORT = 8080

const asyncWrap = 

app.get('/', (_req, res) => {
  fs.readFile(path.join(__dirname, 'search', 'index.html'), (err, data) => {
    if (err) {
      res.send('Error! : ' + err)
    }
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.write(data)
    res.end()
  })
})

/**
 * 응답코드
 * 0: 정상
 * 1: 키워드가 없음
 * 2: 키워드가 2자리 이하
 * 3: 검색 결과 없음
 * -1: 오류
 */
app.get('/search', (req, res) => {
  const keyword = req.query.keyword.toLowerCase()
  const dir = path.join(__dirname, 'TIL')
  const searchFiles = []

  console.log('Search:', keyword)

  // 키워드가 없는 경우
  if (!keyword) {
    res.json({ code: 1, data: [] })
    return
  }

  if (keyword.length < 2) {
    res.json({ code: 2, data: [] })
    return
  }

  try {
    const yearDirectory = fs.readdirSync(dir, 'utf-8')
    for (let year of yearDirectory) {
      const files = fs.readdirSync(path.join(dir, year), 'utf-8')

      for (let file of files) {
        const find = fs.readFileSync(path.join(dir, year, file), 'utf-8')
            .toString()
            .toLowerCase()
            .includes(keyword) 
            
        if (find) {
          searchFiles.push(`${year}_${file}`)
        }
      }
    }

    const code = searchFiles.length ? 0 : 3

    res.json({ code, data: searchFiles })
  } catch (err) {
    res.json({ code: -1, err })
  }
})

process.on('uncaughtException', err => {
  console.log('uncaughtException >', err)
})

app.listen(PORT, () => {
  console.log('Search server started.', PORT)
})
