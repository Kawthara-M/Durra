
const axios = require("axios")
const cheerio = require("cheerio") // parse the html returned
const qs = require("qs") // for sending form data in http requests

async function verifyDANATReport(reportNo, reportDate) {
  const url = "https://www.danat.bh/verify-reports/"

  const formData = {
    _wpcf7: "15283",
    _wpcf7_version: "5.3.2",
    _wpcf7_locale: "en_US",
    _wpcf7_unit_tag: "wpcf7-f15283-p15284-o1",
    _wpcf7_container_post: "15284",
    _wpcf7_posted_data_hash: "",
    report_no: reportNo,
    report_date: reportDate,
  }

  try {
    const response = await axios.post(url, qs.stringify(formData), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    const $ = cheerio.load(response.data)

    // Try to get the message
    const messageEl = $(".bg-danger, .bg-success")

    if (messageEl.length > 0) {
      const isError = messageEl.hasClass("bg-danger")
      const isSuccess = messageEl.hasClass("bg-success")

      if (isError) {
        const errorText = messageEl.text().trim()
        console.log("Error:", errorText)
      }

      if (isSuccess) {
        const successText = messageEl.text().trim()
        const downloadLink = messageEl.find("a").attr("href")
        console.log("Success:", successText)
        console.log("Download link:", downloadLink)
      }
    } else {
      console.log("No result message found.")
    }
  } catch (err) {
    console.error("Error:", err.message)
  }
}
