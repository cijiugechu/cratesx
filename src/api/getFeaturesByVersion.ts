import NodeCache from 'node-cache'
import * as https from 'https'
import { sparseIndexServerURL } from './sparse-index-server'

export type CrateMetadataV2 = {
	name: string
	versions: Array<string>
	features: Features
}

export type Features = Record<string, Array<string>>

const cache = new NodeCache({ stdTTL: 60 * 10 })

const versions = (name: string, indexServerURL: string) => {
	// clean dirty names
	name = name.replace(/"/g, '')

	return new Promise<CrateMetadataV2>(function (resolve, reject) {
		const cached = cache.get<CrateMetadataV2>(name)
		if (cached) {
			resolve(cached)
			return
		}
		// compute sparse index prefix
		var prefix
		var lower_name = name.toLowerCase()
		if (lower_name.length <= 2) {
			prefix = lower_name.length
		} else if (lower_name.length == 3) {
			prefix = '3/' + lower_name.substring(0, 1)
		} else {
			prefix = lower_name.substring(0, 2) + '/' + lower_name.substring(2, 4)
		}
		var req = https.get(
			`${indexServerURL}/${prefix}/${lower_name}`,
			function (res) {
				// reject on bad status
				if (!res.statusCode) {
					reject(new Error('statusCode=' + res.statusCode))
					return
				}
				if (res.statusCode < 200 || res.statusCode >= 300) {
					return reject(new Error('statusCode=' + res.statusCode))
				}
				// cumulate data
				var crate_metadatas: CrateMetadataV2
				var body: any = []
				res.on('data', function (chunk) {
					body.push(chunk)
				})
				// resolve on end
				res.on('end', function () {
					try {
						var body_lines = Buffer.concat(body)
							.toString()
							.split('\n')
							.filter(n => n)
						var body_array: any = []
						for (var line of body_lines) {
							body_array.push(JSON.parse(line))
						}
						crate_metadatas = {
							name: name,
							versions: body_array
								.filter((e: any) => e.yanked === false)
								.map((e: any) => e.vers),
							features: body_array.at(-1).features,
						}
						cache.set(name, crate_metadatas)
					} catch (e) {
						reject(e)
					}
					resolve(crate_metadatas)
				})
			},
		)
		// reject on request error
		req.on('error', function (err) {
			// This is not a "Second reject", just a different sort of failure
			reject(err)
		})
		// IMPORTANT
		req.end()
	})
}

export const getFeaturesByVersion = (crateName: string) => {
	return versions(crateName, sparseIndexServerURL).then(data => {
		return data.features
	})
}
