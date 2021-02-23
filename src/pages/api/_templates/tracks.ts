interface GetHTMLProps {
  type: string;
  range: string;
  data: Array<Spotify.Artist | Spotify.Tracks>;
  profile: Spotify.PrivateUser | undefined;
}

interface Map {
  [key: string]: string;
}

const type_text: Map = {
  artists: 'Artists',
  tracks: 'Tracks',
};

const range_text: Map = {
  short_term: 'from last 4 weeks',
  medium_term: 'from last 6 months',
  long_term: 'from all time',
};

export function getTracksHtml({ type, range, data: tracks, profile }: GetHTMLProps) {
  const data = tracks as Array<Spotify.Tracks>;

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
      <title>Image</title>
  
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap"
        rel="stylesheet"
      />
  
      <style>
        * {
          padding: 0;
          margin: 0;
          box-sizing: border-box;
          font-family: Roboto Mono;
        }
  
        #wrapper {
          width: 100vw;
          height: 100vh;
          background-color: #ee1f9d;
          padding: 70px 15px 15px;
        }
  
        .bunchify_container {
          position: absolute;
          top: 55px;
          left: 15px;
        }
        
        .bunchify_title {
          color: #181818;
          font-size: 12px;
          font-weight: 200;
          text-align: right;
        }
  
        .content {
          position: relative;
          width: 100%;
          height: 100%;
          background-color: #181818;
          padding: 15px;
        }

        .profile_container {
          display: flex;
          flex-direction: row;
          align-items: center;
          position: absolute;
          top: 15px;
          lefT: 15px;
        }

        .profile_avatar {
          background-image: url('${profile?.images[0].url}');
          background-size: cover;
          background-position: center center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
        }

        .profile_name {
          font-size: 15px;
          color: #fff;
          margin-left: 4px;
        }
  
        .logo_container {
          position: absolute;
          padding: 15px;
          right: 0;
          top: 0;
        }
  
        .heading_content {
          margin-top: 60px;
        }
  
        .type_title {
          font-size: 28px;
          color: #ee1f9d;
          line-height: 1;
          margin-left: 2px;
        }
  
        .type_title_highlight {
          font-size: 48px;
          color: #dbfa84;
          line-height: 1;
        }
  
        .type_subtitle {
          font-size: 17px;
          color: #ee1f9d;
          margin-left: 2px;
        }
  
        .ranking_container {
          margin-top: 32px;
        }
  
        .top_one_container {
          display: flex;
          position: relative;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
  
        .rank_one_position {
          position: absolute;
          color: #ee1f9d;
          font-size: 20px;
          top: 0;
          left: 40px;
        }
  
        .rank_one_title {
          font-size: 18px;
          margin-top: 8px;
          color: #dbfa84;
        }
  
        .top_three_container {
          margin-top: 20px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
  
        .rank_three_container {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          width: 44%;
        }
  
        .rank_three_position {
          position: absolute;
          color: #ee1f9d;
          font-size: 16px;
          top: 0px;
          left: 0;
        }
  
        .rank_three_title {
          margin-top: 4px;
          font-size: 15px;
          color: #dbfa84;
          text-align: center;
        }
  
        .top_five_container {
          display: flex;
          flex-direction: column;
          position: relative;
          margin-top: 28px;
        }
  
        .rank_five_container {
          display: flex;
          flex-direction: row;
          align-items: center;
          margin-bottom: 16px;
        }
  
        .rank_five_position {
          color: #ee1f9d;
          font-size: 16px;
          margin-right: 8px;
        }
  
        .rank_five_title {
          font-size: 16px;
          color: #dbfa84;
          margin-left: 8px;
        }
      </style>
    </head>
    <body>
      <div id="wrapper">
        <div class="bunchify_container">
          <h1 class="bunchify_title">Made with Bunchify app.</h1>
        </div>
  
        <div class="content">
          ${
            profile &&
            `<div class="profile_container">
              <div class="profile_avatar"></div>
              <h1 class="profile_name">${profile.display_name}</h1>
            </div>`
          }

          <div class="logo_container">
            <img src="https://bunchify.vercel.app/Spotify_Logo_RGB_White.png" height="30px" />
          </div>
  
          <div class="heading_content">
            <h1 class="type_title">Your Top</h1>
            <h2 class="type_title_highlight">${type_text[type]}</h2>
            <h3 class="type_subtitle">${range_text[range]}</h3>
          </div>
          <div class="ranking_container">
          ${
            data.length > 0 &&
            `<div class="top_one_container">
              <span class="rank_one_position">1.</span>
              <img src="${data[0].album.images[1].url}" width="120px" />
              <h1 class="rank_one_title">${data[0].name}</h1>
            </div>`
          }
          ${
            data.length > 1 &&
            `<div class="top_three_container">
              <div class="rank_three_container">
                <span class="rank_three_position">2.</span>
                <img src="${data[1].album.images[1].url}" width="80px" />
                <h1 class="rank_three_title">${data[1].name}</h1>
              </div>`
          }
          ${
            data.length > 2 &&
            `<div class="rank_three_container">
                <span class="rank_three_position">3.</span>
                <img src="${data[2].album.images[1].url}" width="80px" />
                <h1 class="rank_three_title">${data[2].name}</h1>
              </div>
            </div>`
          }
          <div class="top_five_container">
          ${
            data.length > 3 &&
            `<div class="rank_five_container">
                <span class="rank_five_position">4.</span>
                <img src="${data[3].album.images[1].url}" width="40px" height="40px" />
                <h1 class="rank_five_title">${data[3].name}</h1>
              </div>`
          }
          ${
            data.length > 4 &&
            `<div class="rank_five_container">
                <span class="rank_five_position">5.</span>
                <img src="${data[4].album.images[1].url}" width="40px" height="40px" />
                <h1 class="rank_five_title">${data[4].name}</h1>
              </div>`
          }
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}
