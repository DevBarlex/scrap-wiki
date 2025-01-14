const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const app = express();

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

// Función para realizar el scraping
const scrapePage = async (pageUrl) => {
    try {
        const response = await axios.get(pageUrl);
        const $ = cheerio.load(response.data);

        const pageTitle = $('h1').text();
        const images = [];
        $('img').each((index, element) => {
            const imgSrc = $(element).attr('src');
            images.push(imgSrc);
        });

        const paragraphs = [];
        $('p').each((index, element) => {
            paragraphs.push($(element).text());
        });

        const internalLinks = [];
        $('#mp-upper a').each((index, element) => {
            const link = $(element).attr('href');
            internalLinks.push(link);
        });

        return {
            title: pageTitle,
            images,
            paragraphs,
            internalLinks
        };

    } catch (error) {
        console.error("Error scraping page:", pageUrl, error);
    }
};

app.get('/', async (req, res) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const musicianData = [];

        $('#mw-pages a').each(async (index, element) => {
            const musicianLink = $(element).attr('href');
            const musicianUrl = `https://es.wikipedia.org${musicianLink}`;
            
            const data = await scrapePage(musicianUrl);
            musicianData.push(data);

            console.log(`Scraped data for ${data.title}`);
        });

        
        res.json(musicianData);

    } catch (error) {
        console.error("Error scraping category page:", error);
        res.status(500).send("Error scraping category page.");
    }
});


app.listen(3000, () => {
    console.log("Servidor escuchando en http://localhost:3000");
});