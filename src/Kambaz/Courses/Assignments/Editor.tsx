export default function AssignmentEditor() {
  return (
    <div id="wd-assignments-editor">
      <label htmlFor="wd-name"><h4>Assignment Name</h4></label>
      <input id="wd-name" value="A1 - ENV + HTML" /><br /><br />
      <textarea id="wd-description">
        The assignment is available online Submit a link to the landing page of
      </textarea>
      <br/><br/>
      <table>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-points">Points</label>
          </td>
          <td>
            <input id="wd-points" value={100} />
          </td>
        </tr><br/>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-group">Assignment Group</label>
          </td>
          <td>
            <select id="wd-group">
              <option value="ASSIGNMENTS">ASSIGNMENTS</option>
              <option value="QUIZZES">QUIZZES</option>
              <option value="EXAMS">EXAMS</option>
              <option value="PROJECT">PROJECT</option>
            </select>
          </td>
        </tr><br/>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-display-grade-as">Display Grade as</label>
          </td>
          <td>
            <select id="wd-display-grade-as">
              <option value="PERCENTAGE">Percentage</option>
              <option value="RAW-SCORE">Raw Score</option>
            </select>
          </td>
        </tr><br/>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-submission-type">Submission Type</label>
          </td>
          <td>
            <select id="wd-submission-type">
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">Offline</option>
            </select><br/><br/>
            <label>Online Entry Options</label><br/>
            <input type="checkbox" name="check-text-entry" id="wd-text-entry"/>
            <label htmlFor="wd-text-entry">Text Entry</label><br/>
            <input type="checkbox" name="check-website-url" id="wd-website-url"/>
            <label htmlFor="wd-website-url">Website URL</label><br/>
            <input type="checkbox" name="check-media-recordings" id="wd-media-recordings"/>
            <label htmlFor="wd-media-recordings">Media Recordings</label><br/>
            <input type="checkbox" name="check-student-annotation" id="wd-student-annotation"/>
            <label htmlFor="wd-student-annotation">Student Annotation</label><br/>
            <input type="checkbox" name="check-file-upload" id="wd-file-upload"/>
            <label htmlFor="wd-file-upload">File Uploads</label><br/>
          </td>
        </tr><br/>
        <tr>
          <td align="right" valign="top">
            <label htmlFor="wd-assign-to">Assign</label>
          </td>
          <td>
            <label htmlFor="wd-assign-to">Assign To</label><br/>
            <input value="Everyone" id="wd-assign-to" /><br/><br/>
            <label htmlFor="wd-due-date">Due</label><br/>
            <input type="date" value="2025-05-13" id="wd-due-date" /><br/><br/>
            <table>
              <tr>
                <td><label htmlFor="wd-available-from">Available from</label></td>
                <td><label htmlFor="wd-available-until">Until</label></td>
              </tr>
              <tr>
                <td><input type="date" value="2025-05-06" id="wd-available-from" /></td>
                <td><input type="date" value="2025-05-20" id="wd-available-until" /></td>
              </tr>
            </table>
          </td>
        </tr><br/>
        <tr><td><hr/></td><td><hr/></td></tr>
        <tr>
          <td></td>
          <td align="right" valign="top">
            <button id="wd-cancel">Cancel</button>
            <button id="wd-save">Save</button>
          </td>
        </tr>
      </table>
    </div>
);}
