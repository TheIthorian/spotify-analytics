package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type JsonStreamHistory struct {
	Ts                                string `json:"ts"`
	Username                          string `json:"username"`
	Platform                          string `json:"platform"`
	Ms_Played                         int    `json:"ms_played"`
	Master_Metadata_Track_Name        string `json:"master_metadata_track_name"`
	Master_Metadata_Album_Artist_Name string `json:"master_metadata_album_artist_name"`
	Master_Metadata_Album_Album_Name  string `json:"master_metadata_album_album_name"`
	Spotify_Track_Uri                 string `json:"spotify_track_uri"`
	Episode_Name                      string `json:"episode_name"`
	Episode_Show_Name                 string `json:"episode_show_name"`
	Spotify_Episode_Uri               string `json:"spotify_episode_uri"`
	Reason_Start                      string `json:"reason_start"`
	Reason_End                        string `json:"reason_end"`
	Shuffle                           bool   `json:"shuffle"`
	Skipped                           bool   `json:"skipped"`
	Offline                           bool   `json:"offline"`
	Offline_Timestamp                 int    `json:"offline_timestamp"`
	Incognito_Mode                    bool   `json:"incognito_mode"`
}

type StreamHistory struct {
	id         int
	trackName  string
	albumName  string
	artistName string
	msPlayed   int
	datePlayed time.Time

	platform        string
	spotifyTrackUri string

	isSong          bool
	episodeName     string
	episodeShowName string
	spotifyShowUri  string

	shuffle bool
	skipped bool
	offline bool

	reasonStart   string
	reasonEnd     string
	incognitoMode bool
}

func main() {
	db, err := sql.Open("sqlite3", dbFile)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	t1 := time.Now()
	fileQueue, err := getFileQueue(db)
	if err != nil {
		log.Fatal(err)
	}

	for _, file := range fileQueue {
		processFile(&file, db)
	}

	elapsed := time.Since(t1)
	fmt.Println("elapsed: ")
	fmt.Println(elapsed)

}

func processFile(uploadFile *UploadFileQueue, db *sql.DB) {
	// Read JSON file
	file, err := os.Open(uploadFile.filePath)
	if err != nil {
		log.Fatal(err)
	}
	defer file.Close()

	byteValue, err := ioutil.ReadAll(file)
	if err != nil {
		log.Fatal(err)
	}

	// Parse JSON data
	var tracks []JsonStreamHistory
	err = json.Unmarshal(byteValue, &tracks)
	if err != nil {
		log.Fatal(err)
	}

	var streamHistoryRecords []StreamHistory
	for _, track := range tracks {
		layout := "2006-01-02T15:04:05Z"
		t, err := time.Parse(layout, track.Ts)

		if err != nil {
			fmt.Println(err)
			continue
		}

		var historyRecord = StreamHistory{
			trackName:       track.Master_Metadata_Track_Name,
			albumName:       track.Master_Metadata_Album_Album_Name,
			artistName:      track.Master_Metadata_Album_Artist_Name,
			msPlayed:        track.Ms_Played,
			datePlayed:      t,
			platform:        track.Platform,
			spotifyTrackUri: track.Spotify_Track_Uri,
			isSong:          track.Episode_Name == "",
			episodeName:     track.Episode_Name,
			episodeShowName: track.Episode_Show_Name,
			spotifyShowUri:  track.Spotify_Episode_Uri,
			shuffle:         track.Shuffle,
			skipped:         track.Skipped,
			offline:         track.Offline,
			reasonStart:     track.Reason_Start,
			reasonEnd:       track.Reason_End,
			incognitoMode:   track.Incognito_Mode,
		}
		streamHistoryRecords = append(streamHistoryRecords, historyRecord)
	}

	// Insert data into the database
	insertQuery := "INSERT INTO StreamHistory (trackName, albumName, artistName, msPlayed, datePlayed, platform, spotifyTrackUri, isSong, episodeName, " +
		"episodeShowName, spotifyShowUri, shuffle, skipped, offline, reasonStart, reasonEnd, incognitoMode) VALUES " +
		"(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
	stmt, err := db.Prepare(insertQuery)
	if err != nil {
		log.Fatal(err)
	}
	defer stmt.Close()

	for _, history := range streamHistoryRecords {
		_, err := stmt.Exec(
			history.trackName, history.albumName, history.artistName, history.msPlayed,
			history.datePlayed,
			history.platform,
			history.spotifyTrackUri, history.isSong, history.episodeName, history.episodeShowName, history.spotifyShowUri,
			history.shuffle, history.skipped, history.offline, history.reasonStart, history.reasonEnd, history.incognitoMode,
		)
		if err != nil {
			log.Fatal(err)
		}
	}

	deleteFile(uploadFile.filePath)

	fmt.Println("Data inserted into the database successfully.")
}

func print(history StreamHistory) {
	fmt.Println(history.trackName)
	// fmt.Println(history.albumName)
	// fmt.Println(history.artistName)
	// fmt.Println(history.msPlayed)
	fmt.Println(history.datePlayed)
	// fmt.Println(history.platform)
	// fmt.Println(history.spotifyTrackUri)
	fmt.Println(history.isSong)
	fmt.Println(history.episodeName)
	// fmt.Println(history.episodeShowName)
	// fmt.Println(history.spotifyShowUri)
	// fmt.Println(history.shuffle)
	// fmt.Println(history.skipped)
	// fmt.Println(history.offline)
	// fmt.Println(history.reasonStart)
	// fmt.Println(history.reasonEnd)
	// fmt.Println(history.incognitoMode)
}

type UploadFileQueue struct {
	id       int
	status   int
	filePath string
	fileName sql.NullString
	mimeType string
	size     int
	MD5      string
}

func getFileQueue(db *sql.DB) ([]UploadFileQueue, error) {
	rows, err := db.Query("SELECT id, status, filePath, filename, mimetype, size, md5 FROM UploadFileQueue WHERE status = 0 LIMIT 1")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var data []UploadFileQueue
	for rows.Next() {
		var d UploadFileQueue
		rows.Scan(&d.id, &d.status, &d.filePath, &d.fileName, &d.mimeType, &d.size, &d.MD5)
		if err != nil {
			return nil, err
		}
		data = append(data, d)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return data, nil
}

// fix
func deleteFile(filePath string) error {
	err := os.Remove(filePath)
	if err != nil {
		return err
	}

	fmt.Printf("File %s deleted successfully\n", filePath)
	return nil
}
