<table align="center" width="95%%">

<tr>
  <td class="formTitle"><a href="<%=urlHandlers.UHRoomBookingAdmin.getURL()%>">&lt;&lt;Back</a></td>
</tr>
<% if actionSucceeded: %>
<tr>
  <td>
    <div class="successfulAction">
    <span class="actionSucceeded"> <%= _("Action succeeded.")%></span>  <%= _("A new room has been added.")%>
    </div>
  </td>
</tr>
<% end %>
<tr>
  <td>
<!-- ==================== General Options ====================== -->
<!-- =========================================================== -->
    <table style="margin-top: 20px;">
    <tr>
      <td colspan="2" class="groupTitle">Location data</td>
    </tr>
    <tr>
      <td class="titleUpCellTD" style="width: 160px;"><span class="titleCellFormat">Name</span></td>
      <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;"><%=location.friendlyName%></td>
    </tr>
    <tr>
      <td class="titleUpCellTD" style="width: 160px;"><span class="titleCellFormat">Plugin</span></td>
      <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;"><%=location.factory.getName()%></td>
    </tr>
    <tr>
      <td class="titleUpCellTD" style="width: 160px;"><span class="titleCellFormat">Available Rooms</span></td>
      <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;">
        <% rooms = location.factory.newRoom().getRooms(location=location.friendlyName) %>
        <%=len(rooms)%> rooms found in this location.
        <% url = urlHandlers.UHRoomBookingRoomDetails.getURL() %>
        <form method="post" action="<%=url%>">
        <input type="hidden" name="roomLocation" value="<%=location.friendlyName%>">
        <select name="roomID">
          <% for room in rooms: %>
            <option value="<%=room.id%>" class="<%=roomClass( room )%>"><%= room.getFullName() %></option>
          <% end %>
        </select>
        <input class="btn" type="submit" value="Details"/>
        <input class="btn" type="submit" value="Modify" onClick="this.form.action='<%= urlHandlers.UHRoomBookingRoomForm.getURL( )%>'; this.form.submit();"/>
        <input class="btn" type="submit" value="Delete" onClick="if (confirm('Are you sure you want to delete this room? All related bookings will also be deleted. this action is PERMANENT!')) {this.form.action='<%= urlHandlers.UHRoomBookingDeleteRoom.getURL( )%>'; this.form.submit();} else { return false; }"/>
        </form>
        <form method="post" action="<%=urlHandlers.UHRoomBookingRoomForm.getURL( )%>">
        <input type="hidden" name="roomLocation" value="<%=location.friendlyName%>">
        <input class="btn" type="submit" value="New Room"/>
        </form>
      </td>
    </tr>
    </table>

    <br/>

    <table>
    <tr>
      <td colspan="2" class="groupTitle">General options</td>
    </tr>
    <tr>
      <td class="titleUpCellTD" style="width: 160px;"><span class="titleCellFormat">Possible equipment</span></td>
      <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;">
        <% if AttsManager.supportsAttributeManagement(): %>
            <p style="color: Green;">This location supports dynamic equipment management.</p>
	        <form action="<%=urlHandlers.UHRoomBookingSaveEquipment.getURL(location) %>" method="POST">
	          <p>
	            <input type="text" id="newEquipmentName" name="newEquipmentName" value="" size="28" />
	            <input type="submit" class="btn" value="Add" />
	          </p>
	        </form>
	        <form action="<%=urlHandlers.UHRoomBookingDeleteEquipment.getURL(location) %>" method="POST">
	          <p>
	            <select name="removeEquipmentName" id="removeEquipmentName">
	                <% for eq in possibleEquipment: %>
	                    <option value="<%=eq%>"><%=eq%></option>
	                <% end %>
	            </select>
	            <input type="submit" class="btn" value="Remove" />
	          </p>
	        </form>
	        <p>Information:</p>
	        <ul style="text-align:justify; font-size: smaller;">
	            <li>Use this to define set of possible equipment for room in the active location.</li>
	            <li>On the room searching form, user will be able to choose equipment from this set.</li>
	            <li>On new room creation form, you will be able to choose equipment from this set.</li>
	        </ul>
        <% end %>
        <% if not AttsManager.supportsAttributeManagement(): %>
            <span style="color: Red;">This location does not support dynamic equipment management.</span><br />
        <% end %>
      </td>
    </tr>
    <tr><td>&nbsp;</td></tr>
    <tr>
      <td class="titleUpCellTD" style="width: 160px;"><span class="titleCellFormat">Custom room attributes</span></td>
      <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;">
        <% if AttsManager.supportsAttributeManagement(): %>
            <p style="color: Green;">This location supports dynamic attributes management.</p>
            <form action="<%=urlHandlers.UHRoomBookingSaveCustomAttributes.getURL(location)%>" method="post">
                <table>
                <tr>
                    <td style="width: 200px;"><b>Name</b></td><td style="width: 70px;"><b>Required</b></td><td style="width: 70px;"><b>Hidden</b></td><td style="width: 260px;"><b>Actions</b></td>
                </tr>
                <% for at in AttsManager.getAttributes(location = location.friendlyName): %>
                    <tr>
                        <td><%= at['name'] %></td>
                        <td><input type="checkbox" name="<%= 'cattr_req_' + at['name'] %>" <% if at['required']:%>checked="checked"<%%> /></td>
                        <td><input type="checkbox" name="<%= 'cattr_hid_' + at['name'] %>" <% if at.get('hidden',False):%>checked="checked"<%%> /></td>
                        <td><input type="button" class="btn" value="Remove" onclick="document.location = '<%= urlHandlers.UHRoomBookingDeleteCustomAttribute.getURL( location, removeCustomAttributeName = at['name'] ) %>'; return false;" /></td>
                    </tr>
                <% end %>
                <tr>
                    <td><input type="text" name="newCustomAttributeName" id="newCustomAttributeName" /></td>
                    <td><input type="checkbox" name="newCustomAttributeIsRequired" id="newCustomAttributeIsRequired" /></td>
                    <td><input type="checkbox" name="newCustomAttributeIsHidden" id="newCustomAttributeIsHidden" /></td>
                    <td><input type="submit" class="btn" value="Add new" /></td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <input type="submit" class="btn" value="Save" /><% inlineContextHelp( 'Updates `required` and `hidden` for all existing attributes.' ) %>
                    </td>
                </tr>
                </table>
            </form>
	        <p>Information:</p>
	        <ul style="text-align:justify; font-size: smaller;">
	            <li>Use this to define room attribues that are specific to the location.</il>
	            <li>Custom attributes are subject to free-text search. This means that they <b>will</b> work with "Room description must contain" box on a searching form.</li>
	            <li>Custom attributes does not have type. They are kept as free text. It is impossible to add any kind of validation without coding.</li>
	        </ul>
        <% end %>
        <% if not AttsManager.supportsAttributeManagement(): %>
            <span style="color: Red;">This location does not support dynamic attributes management.</span><br />
        <% end %>
      </td>
    </tr>
    </table>
    <br>


<!-- ============== Key Performance Indicators ================= -->
<!-- =========================================================== -->
    <a name="kpi"></a>
    <table>
    <tr>
      <td colspan="5" class="groupTitle">Key Performance Indicators</td>
    </tr>
    <% if not withKPI: %>
        <tr>
          <td colspan="2" style="padding-left: 30px; padding-top: 30px;">
            <a href="<%=urlHandlers.UHRoomBookingAdminLocation.getURL(location, withKPI=True)%>">Show Key Performance Indicators</a><br />
             Computations may take <strong>several minutes</strong>.
          </td>
          <br /><br />
        </tr>
    <% end %>
    <% if withKPI: %>
        <tr>
          <td class="titleUpCellTD" style="width: 100px;"><span class="titleCellFormat">Rooms</span></td>
          <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;">
            <table>
            <tr>
                <td style="text-align: right;">Average occupation:</td>
                <td><span style="background-color: #C9FFC9; font-weight: bold;"><%= kpiAverageOccupation %></span> <% inlineContextHelp( 'Average room occupation in last 30 days during working hours (8H30-17H30, Monday-Friday including holidays). Only active, publically reservable rooms are taken into account.' ) %></td>
            </tr>
            <tr><td>&nbsp;</td></tr>
            <tr>
                <td style="width: 140px; text-align: right;">Total:</td>
                <td><%=kpiTotalRooms %> <% inlineContextHelp( 'Total number of rooms (including deactivated).' ) %></td>
            </tr>
            <tr>
                <td style="text-align: right;">Active:</td>
                <td><%=kpiActiveRooms %> <% inlineContextHelp( 'Total number of active rooms.' ) %></td>
            </tr>
            <tr>
                <td style="text-align: right;">Reservable:</td>
                <td><%=kpiReservableRooms %> <% inlineContextHelp( 'Total number of rooms that are <b>publically</b> reservable. The rest are reservable only by people responsible.' ) %></td>
            </tr>
            <tr><td>&nbsp;</td></tr>
            <tr>
                <td style="text-align: right;">Reservable capacity:</td>
                <td><%=kpiReservableCapacity%> <% inlineContextHelp( 'Total capacity of rooms that are <b>publically</b> reservable.' ) %></td>
            </tr>
            <tr>
                <td style="text-align: right;">Reservable surface:</td>
                <td><%=kpiReservableSurface%> m&sup2; <% inlineContextHelp( 'Total surface of rooms that are <b>publically</b> reservable.' ) %></td>
            </tr>
            </table>
          </td>
        </tr>
        <tr><td>&nbsp;</td></tr>
        <tr>
          <td class="titleUpCellTD" style="width: 100px;"><span class="titleCellFormat">Bookings</span></td>
          <td bgcolor="white" valign="top" class="blacktext" style="padding-left: 12px;">
            <table>
            <tr>
                <td>Total:</td>
                <td><%=kbiTotalBookings%> <% inlineContextHelp( 'Total number of bookings including archival, cancelled and rejected.' ) %></td>
            </tr>
            </table>
            <br />
            <table>
                <tr>
                    <td style="width: 70px;"></td>
                    <td style="width: 70px;">Valid</td>
                    <td style="width: 70px;">Cancelled</td>
                    <td style="width: 70px;">Rejected</td>
                </tr>
                <tr>
                    <td>Live</td>
                    <td><span style="background-color: #C9FFC9; font-weight: bold;"><%= stats['liveValid'] %></span></td>
                    <td><%= stats['liveCancelled'] %></td>
                    <td><%= stats['liveRejected'] %></td>
                </tr>
                <tr>
                    <td>Archival</td>
                    <td><%= stats['archivalValid'] %></td>
                    <td><%= stats['archivalCancelled'] %></td>
                    <td><%= stats['archivalRejected'] %></td>
                </tr>
                <tr>
                    <td>Total</td>
                    <td><%= stats['liveValid'] + stats['archivalValid'] %></td>
                    <td><%= stats['liveCancelled'] + stats['archivalCancelled'] %></td>
                    <td><%= stats['liveRejected'] + stats['archivalRejected'] %></td>
                </tr>
            </table>
          </td>
        </tr>
      <% end %>
      </table>
    <br />
  </td>
</tr>
</table>
