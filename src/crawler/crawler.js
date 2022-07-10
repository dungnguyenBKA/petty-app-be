import fetch from 'node-fetch';
import * as cheerio from "cheerio";
import NovelModel from "../models/NovelModel.js";

export async function getHtmlFromUrl(url) {
  try {
    const res = await fetch(url)
    return await res.text()
  } catch (e) {
    console.error(e)
    return ""
  }
}


export function getListNovelFromHtml(htmlText) {
  const $ = cheerio.load(htmlText)

  const list = $(".list.list-truyen.col-xs-12")[0]
  const rowItems = $(list).find(".row")

  const novels = []

  for (let i = 0; i < rowItems.length; i++) {
    const item = rowItems[i]
    const coverImageElement = $(item).find(".lazyimg")[0]
    const aElement = $(item).find("a")[0]

    const coverImage = $(coverImageElement).data().image
    const title = $(aElement).text()
    const detailLink = $(aElement).attr('href')
    const author = $($(item).find(".author")[0]).text().trim()

    novels.push({
      coverImage, title, detailLink, author
    })
  }

  return novels
}

export async function saveToDatabase() {
  const urls = genUrlFull()

  let allNovels = []

  for (let i = 0; i < 50; i++) {
    const htmlText = await getHtmlFromUrl(urls[i])
    allNovels = [...allNovels, ...getListNovelFromHtml(htmlText)]
    console.log(`Page ${i + 1} done`)
  }

  NovelModel.insertMany(allNovels, (error, docs) => {
    if (error) {
      console.error(error)
      return
    }

    console.log("Success", {docs})
  })
}

export const BASE_URL = "https://truyenfull.vn/danh-sach/truyen-full/"

export function genUrlFull() {
  const urls = []
  urls.push(BASE_URL)
  for (let i = 1; i < 627; i++) {
    urls.push(BASE_URL + `trang-${i}/`)
  }
  return urls
}
