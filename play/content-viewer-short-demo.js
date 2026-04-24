import { ContentViewer } from '../src/ui/prompt/ContentViewer.js'
import Logger from '@nan0web/log'
import DBFS from '@nan0web/db-fs'

const fs = new DBFS({ root: 'play/data' })

export async function runContentViewerShortDemo(console, inputAdapter, t) {
	console.info(Logger.style(t('Content Viewer Short Demo (Adaptive Height)'), { color: Logger.MAGENTA }))

	const doc = await fs.fetch('en/components/content-viewer-short')

	const translateDeep = (obj) => {
		if (typeof obj === 'string') return t(obj)
		if (Array.isArray(obj)) return obj.map(translateDeep)
		if (typeof obj === 'object' && obj !== null) {
			const res = {}
			for (const key of Object.keys(obj)) {
				// Skip configuration keys and metadata
				if (key.startsWith('$') || key === 'type' || key === 'id' || key === 'required') {
					res[key] = obj[key]
					continue
				}
				res[key] = translateDeep(obj[key])
			}
			return res
		}
		return obj
	}

	const content = translateDeep(doc.content)


	const result = await inputAdapter.request({
		type: 'ContentViewer',
		content,
		title: t(doc.title || 'Short Document')
	})

	if (result.cancelled) {
		console.info(Logger.style('\n' + t('Viewer closed.'), { color: Logger.DIM }))
	} else {
		console.success(`\n✓ ${t('You selected:')} ${JSON.stringify(result.value)}`)
	}
}
