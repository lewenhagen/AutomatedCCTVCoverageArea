/**
 * @author Kenneth Lewenhagen
 * @module generate.js
 */

import * as turf from '@turf/turf'
import { promises as fs } from 'fs'
import { Worker } from 'worker_threads'
import os from 'os'
import RBush from 'rbush' // https://github.com/mourner/rbush/blob/master/README.md

const camFile = process.argv[2]
const distance = 75
const circleSteps = 60
const THREAD_COUNT = os.cpus().length

let buildings = await JSON.parse(await readAsync("./data/buildings.geojson", "utf8"))
let cameras = await JSON.parse(await readAsync(`./${camFile}`, "utf8")).cams
let circleHolder = []

console.info(`Running on ${THREAD_COUNT} cores.`)

const tree = new RBush();

// Load features into the index
buildings.features.forEach(feature => {
    const bbox = turf.bbox(feature)
    tree.insert({
        minX: bbox[0],
        minY: bbox[1],
        maxX: bbox[2],
        maxY: bbox[3],
        feature: feature
    })
})

/**
 * Reads file from disk.
 * @param {string} file The filename to read.
 * @returns {json} The file as json.
 */
async function readAsync(file) {
  const geo = await fs.readFile(file, "utf-8")

  return geo
}

/**
 * Create a worker.
 * @param {array} chunk The array to work on.
 * @returns {Promise} The resulting Promise.
 */
function createWorker(chunk) {
    return new Promise(function (resolve, reject) {
        const worker = new Worker(`./worker.js`, {
            workerData: chunk,
        })
        worker.on("message", (data) => {
            worker.terminate()
            resolve(data)
        })
        worker.on("error", (msg) => {
            reject(`An error ocurred: ${msg}`)
        })
    })
}

/**
 * Main function.
 */
async function main() {
    let workerPromises = []
    let result = []

    for (const coord of cameras) {
        let point = turf.point(coord)
        let options = {units: 'kilometers', steps: circleSteps}
        let circle = turf.circle(point, distance/1000, options)
        const intersectingFeatures = []
        const polygonBbox = turf.bbox(circle)

        // Search the tree with bounding box from circles
        tree.search({
            minX: polygonBbox[0],
            minY: polygonBbox[1],
            maxX: polygonBbox[2],
            maxY: polygonBbox[3]
        }).forEach(item => {
            if (turf.booleanIntersects(item.feature, circle)) {
                intersectingFeatures.push(turf.flatten(item.feature).features[0])
            }
        });

        // Add each circle as Object to the array
        circleHolder.push({"center": point, "area": circle, "buildings": intersectingFeatures})
    }

    // Loop all circles and create chnks to send to worker
    for (let i = 0; i < circleHolder.length; i += THREAD_COUNT) {
        const chunk = circleHolder.slice(i, i + THREAD_COUNT)

        workerPromises.push(createWorker(chunk))
    }

    // Await all workers to finish
    result = (await Promise.all(workerPromises)).flat()
    workerPromises = null

    // Write the resulting GeoJSON to file
    await fs.writeFile('./output/result.geojson', JSON.stringify(result), 'utf8')
}

await main()
