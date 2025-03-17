import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { CircularProgress, Container, Typography, Button, TextField, IconButton, List, ListItem, ListItemText, Box, Divider, Stack, } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";

const VideoPlayer = () => {
  const { courseId, videoId } = useParams();
  const [videoUrl, setVideoUrl] = useState("");
  const [lastPosition, setLastPosition] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [editingNote, setEditingNote] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const theme = useTheme();
  let progressTimeout;

  useEffect(() => {
    fetchVideoDetails();
    fetchNotes();
  }, [courseId, videoId]);

    const fetchVideoDetails = async () => {
      const token = localStorage.getItem("accessToken");

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/v1/courses/student/${courseId}/videos/${videoId}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVideoUrl(response.data.video_file);
        setLastPosition(response.data.last_watched_position || 0);  // Ensure last position is used
        console.log("Fetched last watched position:", response.data.last_watched_position);
      } catch (error) {
        console.error("Failed to load video details:", error);
        setError("Failed to load video. Please try again.");
      } finally {
        setLoading(false);
      }
    };

  //   fetchVideoDetails();
  // }, [courseId, videoId]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const seekToLastPosition = () => {
      if (lastPosition !== null && lastPosition > 0) {
        console.log("Seeking to last watched position:", lastPosition);
        video.currentTime = lastPosition;
      }
    };

    video.addEventListener("loadedmetadata", seekToLastPosition);

    return () => {
      video.removeEventListener("loadedmetadata", seekToLastPosition);
    };
  }, [lastPosition]);

  // Fetch Notes
  const fetchNotes = async () => {
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/notes/student/video/${videoId}/notes/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(response.data);
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  };

  const saveProgress = async (currentTime, isCompleted = false) => {
    clearTimeout(progressTimeout);
    progressTimeout = setTimeout(async () => {
      const token = localStorage.getItem("accessToken");

      try {
        await axios.post(
          `http://127.0.0.1:8000/api/v1/courses/student/${courseId}/videos/${videoId}/progress/`,
          { 
            last_watched_position: Math.floor(currentTime), 
            is_completed: isCompleted 
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Progress saved at:", currentTime, isCompleted ? "(Completed)" : "");
      } catch (error) {
        console.error("Failed to update video progress:", error);
      }
    }, 5000);
  };

  // Save New Note with Video Position
  const addNote = async () => {
    if (!newNote.trim()) return;
    const token = localStorage.getItem("accessToken");

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/v1/notes/student/video/${videoId}/notes/`,
        { content: newNote, video_position: Math.floor(videoRef.current.currentTime) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, response.data]);
      setNewNote("");
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  // Delete Note
  const deleteNote = async (noteId) => {
    const token = localStorage.getItem("accessToken");

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/v1/notes/student/note/${noteId}/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes(notes.filter((note) => note.id !== noteId));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Edit Note
  const startEditing = (note) => {
    setEditingNote(note.id);
    setEditedContent(note.content);
  };

  const saveEditedNote = async (noteId) => {
    const token = localStorage.getItem("accessToken");

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/v1/notes/student/note/${noteId}/`,
        { content: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotes(notes.map(note => note.id === noteId ? { ...note, content: editedContent } : note));
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to edit note:", error);
    }
  };

  //Handle Play/Pause
  const togglePlayPause = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  if (loading) return <Container sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ textAlign: "center", mt: 5 }}>{error}</Container>;

  return (
    <Container sx={{ mt: 4 }}>
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        sx={{
          textAlign: "center", 
          padding: "10px", 
          color: "white", 
          background: theme.palette.gradient.primary, 
          borderRadius: "10px"
        }}
      >
        Video Player
      </Typography>

      <video
        ref={videoRef}
        controls
        width="100%"
        onLoadedMetadata={() => {
          if (videoRef.current && lastPosition !== null) {
            console.log("Video metadata loaded, setting playback position:", lastPosition);
            videoRef.current.currentTime = lastPosition;
          }
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.target.currentTime);
          if (Math.floor(e.target.currentTime) % 10 === 0) {
            saveProgress(e.target.currentTime);
          }
        }}
        onEnded={() => {
          console.log("Video completed. Marking as completed.");
          saveProgress(0, true);
          window.dispatchEvent(new Event("videoEnded"));
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Video Controls */}
      <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={() => (videoRef.current.currentTime -= 10)} sx={{ backgroundColor: "#674188" }}>
          <FastRewindIcon /> Backward
        </Button>
        <Button variant="contained" onClick={togglePlayPause} sx={{ backgroundColor: "#674188" }}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />} {isPlaying ? "Pause" : "Play"}
        </Button>
        <Button variant="contained" onClick={() => (videoRef.current.currentTime += 10)} sx={{ backgroundColor: "#674188" }}>
          <FastForwardIcon /> Forward
        </Button>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Notes Section */}
      <Typography variant="h5" sx={{ mt: 4 }}>Notes</Typography>
      <TextField fullWidth label="Write a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} sx={{ mt: 2 }} />
      <Button variant="contained" sx={{ mt: 2 }} onClick={addNote}>Save Note</Button>

      <List sx={{ mt: 3 }}>
        {notes.map((note) => (
          <ListItem key={note.id} divider>
            {editingNote === note.id ? (
              <TextField fullWidth value={editedContent} onChange={(e) => setEditedContent(e.target.value)} />
            ) : (
              <ListItemText primary={`${note.content} (📍 At: ${note.video_position} sec) - ${new Date(note.timestamp).toLocaleString()}`} />
            )}
            <IconButton onClick={() => (editingNote === note.id ? saveEditedNote(note.id) : startEditing(note))}>
              {editingNote === note.id ? <SaveIcon /> : <EditIcon />}
            </IconButton>
            <IconButton sx={{ color: "red" }} onClick={() => deleteNote(note.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default VideoPlayer;
