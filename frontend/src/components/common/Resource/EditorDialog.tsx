import chevronDown from '@iconify/icons-mdi/chevron-down';
import chevronRight from '@iconify/icons-mdi/chevron-right';
import { Icon } from '@iconify/react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import TreeItem from '@material-ui/lab/TreeItem';
import TreeView from '@material-ui/lab/TreeView';
import Editor from '@monaco-editor/react';
import * as yaml from 'js-yaml';
import _ from 'lodash';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import React from 'react';
import getDocDefinitions from '../../../lib/docs';
import { KubeObjectInterface } from '../../../lib/k8s/cluster';
import ConfirmButton from '../ConfirmButton';
import Empty from '../EmptyContent';
import Loader from '../Loader';
import Tabs from '../Tabs';

const useStyle = makeStyles(theme => ({
  dialogContent: {
    height: '80%',
    minHeight: '600px',
    overflowY: 'hidden',
  },
  terminalCode: {
    color: theme.palette.common.white,
  },
  terminal: {
    backgroundColor: theme.palette.common.black,
    height: '500px',
    width: '100%',
    overflow: 'scroll',
    marginTop: theme.spacing(3),
  },
  containerFormControl: {
    minWidth: '11rem',
  },
  scrollable: {
    overflowY: 'auto',
    overflowX: 'hidden',
  },
}));

type KubeObjectIsh = Partial<KubeObjectInterface>;

interface EditorDialogProps extends DialogProps {
  item: KubeObjectIsh | null;
  onClose: () => void;
  onSave: ((...args: any[]) => void) | null;
  onEditorChanged?: ((newValue: string) => void) | null;
  saveLabel?: string;
  errorMessage?: string;
  title?: string;
}

export default function EditorDialog(props: EditorDialogProps) {
  const {
    item,
    onClose,
    onSave,
    onEditorChanged,
    saveLabel,
    errorMessage,
    title,
    ...other
  } = props;
  const editorOptions = {
    selectOnLineNumbers: true,
    readOnly: isReadOnly(),
  };
  const classes = useStyle();
  const [originalCode, setOriginalCode] = React.useState('');
  const [code, setCode] = React.useState(originalCode);
  const [previousVersion, setPreviousVersion] = React.useState('');
  const [error, setError] = React.useState('');
  const [docSpecs, setDocSpecs] = React.useState({});

  React.useEffect(() => {
    if (!item) {
      return;
    }

    const itemCode = yaml.dump(item);
    if (itemCode !== originalCode) {
      setOriginalCode(itemCode);
    }

    if (!item.metadata) {
      return;
    }

    // Only change if the code hasn't been touched.
    if (previousVersion !== item.metadata!.resourceVersion || code === originalCode) {
      setCode(itemCode);
      if (previousVersion !== item.metadata!.resourceVersion) {
        setPreviousVersion(item!.metadata!.resourceVersion);
      }
    }
  }, [item, previousVersion, originalCode, code]);

  function isReadOnly() {
    return onSave === null;
  }

  function onChange(value: string | undefined, ev: Monaco.editor.IModelContentChangedEvent): void {
    setCode(value as string);

    if (error && getObjectFromCode(value as string)) {
      setError('');
    }

    if (onEditorChanged) {
      onEditorChanged(value as string);
    }
  }

  function getObjectFromCode(code: string): KubeObjectInterface | null {
    let codeObj = {};
    try {
      codeObj = yaml.load(code);
    } catch (e) {
      return null;
    }

    return codeObj as KubeObjectInterface;
  }

  function handleTabChange(tabIndex: number) {
    // Check if the docs tab has been selected.
    if (tabIndex !== 1) {
      return;
    }

    const codeObj = getObjectFromCode(code);

    const { kind, apiVersion } = (codeObj || {}) as KubeObjectInterface;
    if (codeObj === null || (!!kind && !!apiVersion)) {
      setDocSpecs({
        error: codeObj === null,
        kind,
        apiVersion,
      });
    }
  }

  function onUndo() {
    setCode(originalCode);
  }

  function handleSave() {
    // Verify the YAML even means anything before trying to use it.
    if (!getObjectFromCode(code)) {
      setError("Error parsing the code. Please verify it's valid YAML!");
      return;
    }

    onSave!(getObjectFromCode(code));
  }

  function makeEditor() {
    return (
      <Box paddingTop={2} height="100%">
        <Editor
          language="yaml"
          theme="vs-dark"
          value={code}
          options={editorOptions}
          onChange={onChange}
          height="600px"
        />
      </Box>
    );
  }

  const errorLabel = error || errorMessage;
  let dialogTitle = title;
  if (!dialogTitle && item) {
    dialogTitle = isReadOnly()
      ? `View: ${item.metadata?.name || 'New Object'}`
      : `Edit: ${item.metadata?.name || 'New Object'}`;
  }

  return (
    <Dialog maxWidth="lg" scroll="paper" fullWidth onBackdropClick={onClose} {...other}>
      {!item ? (
        <Loader />
      ) : (
        <React.Fragment>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogContent className={classes.dialogContent}>
            {isReadOnly() ? (
              makeEditor()
            ) : (
              <Tabs
                onTabChanged={handleTabChange}
                tabProps={{
                  centered: true,
                }}
                tabs={[
                  {
                    label: 'Editor',
                    component: makeEditor(),
                  },
                  {
                    label: 'Documentation',
                    component: (
                      <Box p={2} className={classes.scrollable} height="600px">
                        <DocsViewer docSpecs={docSpecs} />
                      </Box>
                    ),
                  },
                ]}
              />
            )}
          </DialogContent>
          <DialogActions>
            {!isReadOnly() && (
              <ConfirmButton
                disabled={originalCode === code}
                color="secondary"
                aria-label="undo"
                onConfirm={onUndo}
                confirmTitle="Are you sure?"
                confirmDescription="This will discard your changes in the editor. Do you want to proceed?"
              >
                Undo Changes
              </ConfirmButton>
            )}
            <div style={{ flex: '1 0 0' }} />
            {errorLabel && <Typography color="error">{errorLabel}</Typography>}
            <div style={{ flex: '1 0 0' }} />
            <Button onClick={onClose} color="primary" autoFocus>
              Close
            </Button>
            {!isReadOnly() && (
              <Button
                onClick={handleSave}
                color="primary"
                disabled={originalCode === code || !!error}
              >
                {saveLabel || 'Save & Apply'}
              </Button>
            )}
          </DialogActions>
        </React.Fragment>
      )}
    </Dialog>
  );
}

export function ViewDialog(props: Omit<EditorDialogProps, 'onSave'>) {
  return <EditorDialog {...props} onSave={null} />;
}

const useStyles = makeStyles(theme => ({
  root: {
    height: 216,
    flexGrow: 1,
    maxWidth: 400,
  },
}));

// @todo: Declare strict types.
function DocsViewer(props: { docSpecs: any }) {
  const { docSpecs } = props;
  const classes = useStyles();
  const [docs, setDocs] = React.useState<object | null>(null);
  const [docsError, setDocsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDocsError(null);

    if (docSpecs.error) {
      setDocsError(`Cannot load documentation: ${docSpecs.error}`);
      return;
    }
    if (!docSpecs.apiVersion || !docSpecs.kind) {
      setDocsError(
        'Cannot load documentation: Please make sure the YAML is valid and has the kind and apiVersion set.'
      );
      return;
    }

    getDocDefinitions(docSpecs.apiVersion, docSpecs.kind)
      .then(result => {
        setDocs(result?.properties || {});
      })
      .catch(err => {
        setDocsError(`Cannot load documentation: ${err}`);
      });
  }, [docSpecs]);

  function makeItems(name: string, value: any, key: string) {
    return (
      <TreeItem
        key={key}
        nodeId={`${key}`}
        label={
          <div>
            <Typography display="inline">{name}</Typography>&nbsp;
            <Typography display="inline" color="textSecondary" variant="caption">
              ({value.type})
            </Typography>
          </div>
        }
      >
        <Typography color="textSecondary">{value.description}</Typography>
        {Object.entries(value.properties || {}).map(([name, value], i) =>
          makeItems(name, value, `${key}_${i}`)
        )}
      </TreeItem>
    );
  }

  return docs === null && docsError === null ? (
    <Loader />
  ) : !_.isEmpty(docsError) ? (
    <Empty color="error">{docsError}</Empty>
  ) : _.isEmpty(docs) ? (
    <Empty>No documentation for type {docSpecs.kind.trim()}.</Empty>
  ) : (
    <Box p={4}>
      <Typography>Showing documentation for: {docSpecs.kind.trim()}</Typography>
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<Icon icon={chevronDown} />}
        defaultExpandIcon={<Icon icon={chevronRight} />}
      >
        {Object.entries(docs || {}).map(([name, value], i) => makeItems(name, value, i.toString()))}
      </TreeView>
    </Box>
  );
}
