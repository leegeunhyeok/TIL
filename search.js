const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()

app.get('/', (req, res) => {
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
 */
app.get('/search', (req, res) => {
  const keyword = req.query.keyword.toLowerCase()
  const dir = path.join(__dirname, 'TIL')
  const searchFiles = []

  // 키워드가 없는 경우
  if (!keyword) {
    res.json({ code: 1, data: [] })
    return
  }

  if (keyword.length <= 2) {
    res.json({ code: 2, data: [] })
    return
  }

  // TIL 디렉토리 내의 모든 파일에서 keyword 조회
  (function search (keyword, next) {
    const years = fs.readdirSync(dir, 'utf-8')
    years.forEach(year => {
      const files = fs.readdirSync(path.join(dir, year), 'utf-8')
      files.forEach(file => {
        const data = fs.readFileSync(path.join(dir, year, file), 'utf-8').toString().toLowerCase()
        if (data.indexOf(keyword) !== -1) {
          searchFiles.push(`${year}_${file}`)
        }
      })
    })
    next(searchFiles)
  })(keyword, result => {
    res.json({ code: 0, data: result })
  })
})

process.on('uncaughtException', err => {
  console.log(err)
})

app.listen(8080, () => {
  console.log('Search server started.')
})
