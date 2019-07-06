[1mdiff --git a/imports/ui/components/WorkbooksDirectories.jsx b/imports/ui/components/WorkbooksDirectories.jsx[m
[1mindex 9428ed4..cafadba 100755[m
[1m--- a/imports/ui/components/WorkbooksDirectories.jsx[m
[1m+++ b/imports/ui/components/WorkbooksDirectories.jsx[m
[36m@@ -165,7 +165,6 @@[m [mclass WorkbooksDirectories extends Component {[m
       classes,[m
     } = this.state;[m
     // eslint-disable-next-line react/prop-types[m
[31m-    console.log(classes);[m
     const { workbooksExists, treeData } = this.props;[m
     const canDrop = ({ node: theNode, nextParent }) => {[m
       /* To prevent a file to be added as a child of a file[m
[36m@@ -226,6 +225,15 @@[m [mclass WorkbooksDirectories extends Component {[m
       }[m
     };[m
 [m
[32m+[m[32m    const shouldDisplayManageClass = () => {[m
[32m+[m[32m      if (Meteor.user()) {[m
[32m+[m[32m        if (Meteor.user().profile.accountType === 'Teacher') {[m
[32m+[m[32m          return true;[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m      return false;[m
[32m+[m[32m    };[m
[32m+[m
     return ([m
       <div>[m
         <Dimmer inverted active={!workbooksExists}>[m
[36m@@ -325,15 +333,17 @@[m [mclass WorkbooksDirectories extends Component {[m
                 {editable ? 'Submit' : <FaPencilAlt /> }[m
 [m
               </Button>[m
[31m-              <Button[m
[31m-                color="blue"[m
[31m-                style={{ marginLeft: '2rem' }}[m
[31m-                onClick={[m
[32m+[m[32m              {shouldDisplayManageClass() ? ([m
[32m+[m[32m                <Button[m
[32m+[m[32m                  color="blue"[m
[32m+[m[32m                  style={{ marginLeft: '2rem' }}[m
[32m+[m[32m                  onClick={[m
                   () => this.openClassModal(selectedWorkbookId, title)[m
                   }[m
[31m-              >[m
[32m+[m[32m                >[m
                 Manage classes[m
[31m-              </Button>[m
[32m+[m[32m                </Button>[m
[32m+[m[32m              ) : null}[m
               <br />[m
               <Checkbox[m
                 style={{ margin: '0.8rem 0' }}[m
