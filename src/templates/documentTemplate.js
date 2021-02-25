import React from "react"
import { graphql } from "gatsby"
import Button from "@material-ui/core/Button"
import Dialog from "@material-ui/core/Dialog"
import DialogActions from "@material-ui/core/DialogActions"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import Grid from "@material-ui/core/Grid"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Paper from "@material-ui/core/Paper"
import TextField from "@material-ui/core/TextField"
import * as StorageManager from "../StorageManager.js"
import { Backdrop, CircularProgress } from "@material-ui/core"

let mr = null
let fm = null
let currentMarkerKey = null
let currentMarkerText = ""

let state = { addCommentButtonDisabled : true, 
              addCommentDialogVisible : false,
              spinnerVisible : false,
              newComment : "",
              comments : [] }


export default class Template extends React.Component {

  constructor(inProps) {
    super(inProps)
    mr = inProps.data.markdownRemark
    fm = mr.frontmatter
    global.showComments = global.showComments.bind(this)
    global.maskScreen = global.maskScreen.bind(this)
    addComment = addComment.bind(this)
    handleDialogClose = handleDialogClose.bind(this)
  }

  componentDidMount = () => loadMarkers()

  render() {
    return (
      <div style={{display: "flex", flexDirection:"column", height:"96vh"}}>
        <Backdrop style={{ color : "#ffffff", zIndex : "999" }} open={state.spinnerVisible}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <Dialog open={state.addCommentDialogVisible} onClose={handleDialogClose} maxWidth="lg" fullWidth={true}>
          <DialogTitle>Add Comment</DialogTitle>
          <DialogContent>
            <TextField label="Enter comment here" fullWidth variant="outlined" onChange={(inEvent) => state.newComment = inEvent.target.value} />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="secondary">Cancel</Button>
            <Button onClick={handleDialogSave} color="primary">Save</Button>
          </DialogActions>
        </Dialog>

        <Paper elevation={5} style={{ margin: "10px", padding: "4px", height:"46px"}}>
          <Grid container>
            <Grid item>
              <Button variant="contained" color="primary" style={{ marginRight: "10px" }} onClick={() => window.location = "/"}>
                Document List
              </Button>
              <Button variant="contained" color="secondary" style={{ marginRight: "10px" }} onClick={addMarker}>
                Add Marker 
              </Button>
              <Button variant="contained" style={{ marginRight:"10px" }} onClick={addComment} disabled={state.addCommentButtonDisabled}>
                Add Comment
              </Button>
              {fm.title}&nbsp;({fm.id}) - {fm.date}
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={5} style={{ margin:"10px", padding: "4px", height:"70vh", overflow:"auto"}}>
          <Grid container>
            <Grid item>
              <div dangerouslySetInnerHTML={{ __html : mr.html }} />
            </Grid>
          </Grid>
        </Paper>

        <Paper elevation={5} style={{ margin : "10px", padding : "4px", height : "30vh", overflow : "auto" }}>
          <div style={{ fontWeight : "bold", position : "sticky", top : "2px", padding : "10px",
              backgroundColor : "#eaeaea", zIndex : 99 }}>
            { currentMarkerText }
          </div>
          <Grid container>
            <Grid item xs>
              <List>
                { currentMarkerKey !== null && state.comments.length === 0 ?
                    <ListItem key={0}><ListItemText primary="No comments for this marker" /></ListItem>
                  :
                  state.comments.map((inItem, inIndex) => { return (
                    <ListItem key={inIndex}>
                      <ListItemText primary={inItem.comment}
                        secondary={`${inItem.author} - ${inItem.dateTime}`} />
                    </ListItem>
                  )})
                }
              </List>
            </Grid>
          </Grid>
        </Paper>

      </div>
    )
  }
}    

async function loadMarkers() {
  const markerKeys = await StorageManager.getAllMarkerKeysFromStorage(fm.id)
  markerKeys.forEach(function(inKey) {
    console.log(inKey)
    linkifyMarker(inKey)
  })
}

async function linkifyMarker(inKey) {
  let marker =  await StorageManager.getMarkerFromStorage(inKey)
  const textNodes = []
  let node = document.body.childNodes[0]
  while (node != null) {
    if (node.nodeType === 3) { textNodes.push(node) }
    if (node.hasChildNodes()) {
      node = node.firstChild
    } else {
      while (
        node.nextSibling == null && node !== document.body
      ) {
        node = node.parentNode
      }
      node = node.nextSibling
    }
  }
  let parentNode = null
  for (let i = 0; i < textNodes.length; i++) {
    if (textNodes[i].data === marker.parentNodeData) {
      parentNode = textNodes[i]
      break;
    }
  }
  console.log(parentNode.data)
  const range = document.createRange()
  range.setStart(parentNode, marker.startOffset)
  range.setEnd(parentNode, marker.endOffset)

  const link = document.createElement("a")
  link.setAttribute("href", "#")
  link.setAttribute("onClick", `showComments("${inKey}")`)
  range.surroundContents(link)
  document.getSelection().removeAllRanges()
}

  global.showComments = async function(inKey) {
    currentMarkerKey = inKey
    const marker = await StorageManager.getMarkerFromStorage(inKey)
    currentMarkerText = marker.markerText
    state.comments.length = 0
    state.addCommentButtonDisabled = false
    marker.comments.forEach(
      inValue => state.comments.push(inValue)
    )
    state.comments.reverse()
    this.setState((inState, inProps) => { return state } ) 
  }

  async function addMarker() {
    let range = null
    if (window.getSelection().rangeCount !== 0 ) {
      range = window.getSelection().getRangeAt(0)
    }
    if (!range) { return }
    const marker = {
      startOffset : range.startOffset,
      endOffset : range.endOffset,
      parentNodeData : range.startContainer.data,
      markerText : range.toString(),
      comments: []
    }
    console.log(marker.parentNodeData)
    const key = `${fm.id}${new Date().getTime()}`
    await StorageManager.saveMarkerToStorage(key, marker)
    document.getSelection().removeAllRanges()
    await linkifyMarker(key)
  }

  // function addComment() {
  //   state.addCommentDialogVisible = true
  //   state.newComment = ""
  //   this.setState((inState, inProps) => { return state })
  // }
  
  var addComment = function() {
    state.addCommentDialogVisible = true
    state.newComment = ""
    this.setState((inState, inProps) => { return state })
  }
  // function handleDialogClose() {

  //   state.addCommentDialogVisible = false
  //   this.setState((inState, inProps) => { return state })

  // }
  var handleDialogClose =  function() {

    state.addCommentDialogVisible = false
    this.setState((inState, inProps) => { return state })

  }

  async function handleDialogSave() {
    handleDialogClose()
    if (state.newComment === null || state.newComment.trim() === "") {
      return;
    }
    const marker = await StorageManager.getMarkerFromStorage( currentMarkerKey )
    // console.log(marker)
    marker.comments.push({
      author : localStorage.getItem("username"),
      dateTime : new Date().toLocaleDateString(),
      comment : state.newComment
    })
    await StorageManager.saveMarkerToStorage(currentMarkerKey, marker, true)
    await global.showComments(currentMarkerKey)
  }

  global.maskScreen = function(inMask) {
    state.spinnerVisible = inMask
    this.setState((inState, inProps) => { return state })
  }

  export const pageQuery = graphql`
    query($slug: String!) {
      markdownRemark(frontmatter: { slug: { eq: $slug }}) {
        html
        frontmatter {
          id
          date(formatString: "MM/DD/YYYY")
          slug
          title
        }
      }
    }
  `