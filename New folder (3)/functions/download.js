const fetch = require('node-fetch');
const cheerio = require('cheerio');

exports.handler = async function(event, context) {
  try {
    const url = (event.queryStringParameters && event.queryStringParameters.url) || '';
    if(!url) return { statusCode: 400, body: JSON.stringify({ error: 'Missing url parameter' }) };
    // normalize
    let input = url.trim();
    if(/^([A-Za-z0-9_-]+)$/.test(input)) input = `https://www.instagram.com/p/${input}/`;
    if(!/^https?:\/\//i.test(input)) input = 'https://' + input;
    const u = new URL(input);
    if(!u.hostname.includes('instagram.com')) return { statusCode: 400, body: JSON.stringify({ error: 'Invalid domain' }) };
    u.search = '';
    const finalUrl = u.toString();

    const res = await fetch(finalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if(!res.ok) return { statusCode: 400, body: JSON.stringify({ error: 'Could not fetch Instagram page' }) };
    const html = await res.text();
    const $ = cheerio.load(html);
    const meta = {};
    $('meta').each((i, el) => {
      const prop = $(el).attr('property') || $(el).attr('name');
      const content = $(el).attr('content');
      if(prop && content) meta[prop] = content;
    });

    let mediaUrl = meta['og:video:secure_url'] || meta['og:video'] || meta['og:image'];
    let type = null;
    if(meta['og:video'] || meta['og:video:secure_url']) type = 'video';
    else if(meta['og:image']) type = 'image';

    if(!mediaUrl) {
      const match = html.match(/window\._sharedData\s*=\s*(\{.+?\});/s);
      if(match) {
        try {
          const data = JSON.parse(match[1]);
          const entry = data.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
          if(entry){
            if(entry.is_video){ mediaUrl = entry.video_url; type='video'; }
            else { mediaUrl = entry.display_url; type='image'; }
            if(entry.edge_sidecar_to_children && entry.edge_sidecar_to_children.edges && entry.edge_sidecar_to_children.edges.length){
              const first = entry.edge_sidecar_to_children.edges[0].node;
              if(first.is_video){ mediaUrl = first.video_url; type='video'; }
              else { mediaUrl = first.display_url; type='image'; }
            }
          }
        } catch(e){}
      }
    }

    if(!mediaUrl) return { statusCode: 404, body: JSON.stringify({ error: 'Media not found. Post may be private or removed.' }) };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, media_url: mediaUrl, source: finalUrl })
    };

  } catch(err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error', details: err.message }) };
  }
};
