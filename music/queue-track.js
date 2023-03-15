const play = require('play-dl');

module.exports = {
    name: 'queue',
    description: 'Queue a track or a list',
    execute: async (message, server, track) => {
        //queue by track title
        if (track.title.length != 0) {
            try {
                //get top result
                let yt_info = await play.search(track.title, {
                    limit: 1,
                    source: {
                        youtube: 'video',
                    }
                });
                if (!yt_info) throw error;

                //info
                track.title = yt_info[0].title;
                track.url = yt_info[0].url;
                track.duration = yt_info[0].durationInSec;
                //push into queue
                server.queue.push(track);
                await message.channel.send(`Added **${track.title}** to the queue`);

                return "none"; //success
            }
            catch(error) {
                return error;
            }
        }

        //queue by track url
        if (track.url.startsWith('https') && play.yt_validate(track.url) === 'video') {
            try {
                let yt_info = await play.video_info(track.url);
                if (!yt_info) throw error;
                
                track.title = yt_info.video_details.title;
                track.duration = yt_info.video_details.durationInSec;
                server.queue.push(track);
                await message.channel.send(`Added **${track.title}** to the queue`);

                return "none"; //success
            }
            catch(error) {
                return error;
            }
        }

        //playlist
        if (track.url.startsWith('https') && play.yt_validate(track.url) === 'playlist') {
            try {
                let yt_info = await play.playlist_info(track.url);
                if (!yt_info) throw error;

                let videos = await yt_info.all_videos();
                videos.forEach((value, index, array) => {
                    let song = {
                        title: '', 
                        url: '', 
                        duration: '', 
                        paused: false, 
                        skipped: false, 
                        timeStamp: 0,
                    };
                    song.title = value.title;
                    song.url = value.url;
                    song.duration = value.durationInSec;
                    server.queue.push(song);
                })
                await message.channel.send(`Added **${videos.length} tracks** to the queue`) 

                return "none"; //success
            }
            catch(error) {
                return error;
            }
        }
        message.channel.send('Invalid url');
        return "Invalid url";
    }
}