import React, { useCallback, useState } from "react";
import Wrapper from "../../../containers/Layout/PageWrapper";
import { Button, Dropdown, DropdownItem, DropdownToggle, Grid ,GridItem, Split, SplitItem } from "@patternfly/react-core";
import { Card, CardBody, CardHeader, CardExpandableContent } from "@patternfly/react-core";
import { Table, TableHeader, TableBody } from "@patternfly/react-table";

export const PACS = () => {
  const [toggle, setToggle] = useState(false)
  const [layout, setLayout] = useState<string>('name')

  const [selected, setSelected] = useState<Array<string>>([])
  const select = useCallback((item) => {
    if (selected.includes(item)) {
      selected.splice(selected.indexOf(item))
      setSelected(selected)
    }
    else
      setSelected([ ...selected, item ])
  }, [selected])

  const [expanded, setExpanded] = useState<Array<string>>([])
  const expand = useCallback((item) => {
    if (expanded.includes(item)) {
      expanded.splice(expanded.indexOf(item))
      setExpanded(expanded)
    }
    else
      setExpanded([ ...expanded, item ])
  }, [expanded])

  const Series = () => {
    const columns = ['Studies', 'Branches', 'Pull requests', 'Workspaces', 'Last commit'];
    const rows = [
      ['Study one', 'Branch one', 'PR one', 'Workspace one', 'Commit one'],
      ['Study two', 'Branch two', 'PR two', 'Workspace two', 'Commit two'],
      ['Study three', 'Branch three', 'PR three', 'Workspace three', 'Commit three']
    ];

    return <Table
      aria-label="Simple Table"
      variant={'compact'}
      borders={'compactBorderless'}
      cells={columns}
      rows={rows}
    >
      <TableHeader />
      <TableBody />
    </Table>
  }

  return (
    <Wrapper>
      <article style={{ width: "75%", margin: "2em auto" }}>
        <Split>
          <SplitItem>
            <h1>PACS Query</h1>
          </SplitItem>
          <SplitItem isFilled />
          <SplitItem>
            <Dropdown
              isOpen={toggle}
              toggle={
                <DropdownToggle id="toggle-id-2" onToggle={()=>setToggle(!toggle)}>
                  Select Layout
                </DropdownToggle>
              }
              dropdownItems={[
                <DropdownItem key="name" onClick={() => setLayout('name')}>By Patient Name</DropdownItem>,
                <DropdownItem key="patid" onClick={() => setLayout('patid')}>By Patient ID or MRN</DropdownItem>,
                <DropdownItem key="study" onClick={() => setLayout('study')}>By Study type/name</DropdownItem>
              ]}
              onSelect={()=>setToggle(!toggle)}
              autoFocus={false}
            />
          </SplitItem>
        </Split>
      </article>
      
      <br />

      {layout === 'name' && <article style={{ display: "flex" }}>
        <Grid hasGutter style={{ width: "75%", margin: "auto" }}>
          <h1>Patient results for <b>Olivia</b></h1>
          <GridItem>
            <Card isExpanded={expanded.includes('item0')}>
              <CardHeader onExpand={()=> expand('item0') }>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p><b>Olivia Portman</b></p>
                      <p>PATID000320010</p>
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>10 studies, 3 available</p>
                      <p></p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>

              <CardExpandableContent>
                <CardBody>
                  <Series/>
                </CardBody>
              </CardExpandableContent>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card isExpanded={expanded.includes('item1')}>
              <CardHeader onExpand={()=> expand('item1') }>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p><b>Olivia Guzman</b></p>
                      <p>PATID000320012</p>
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>3 studies</p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>

              <CardExpandableContent>
                <CardBody>
                  <Series/>
                </CardBody>
              </CardExpandableContent>
            </Card>
          </GridItem>
        </Grid>
      </article>}

      {layout === 'patid' && <article style={{ display: "flex" }}>
        <Grid hasGutter style={{ width: "75%", margin: "auto" }}>
          <h1>Patient results for <b>0032</b></h1>
          <GridItem>
            <Card isExpanded={expanded.includes('item2')}>
              <CardHeader onExpand={()=> expand('item2') }>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p><b>PATID000320010</b></p>
                      <p>Olivia Portman</p>
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>10 studies, 3 available</p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>

              <CardExpandableContent>
                <CardBody>
                  <Series/>
                </CardBody>
              </CardExpandableContent>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card isExpanded={expanded.includes('item3')}>
              <CardHeader onExpand={()=> expand('item3') }>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p><b>PATID000320012</b></p>
                      <p>Olivia Guzman</p>
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>3 studies</p>
                    </div>
                  </SplitItem>
                </Split>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
              </CardHeader>

              <CardExpandableContent>
                <CardBody>
                  <Series/>
                </CardBody>
              </CardExpandableContent>
            </Card>
          </GridItem>
        </Grid>
      </article>}

      {layout === 'study' && <article style={{ display: "flex" }}>
        <Grid hasGutter style={{ width: "75%", margin: "auto" }}>
          <h1>Study results for <b>Chest-Xray</b></h1>
          <GridItem>
            <Card isSelectable isSelected={selected.includes("item0")} onClick={()=> select("item0")}>
              <CardHeader>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "25%" }}>
                    <div>
                      <p><b>STDY0343220010</b></p>
                      <p style={{ color: "gray" }}>Chest xray for something, 3 series</p>
                    </div>
                  </SplitItem>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p>15th May 2021</p>
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>Olivia Portman</p>
                      <p style={{ color: "gray" }}>PATID000320010</p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>
            </Card>
          </GridItem>
          
          <GridItem>
            <Card isSelectable isSelected={selected.includes("item1")} onClick={()=> select("item1")}>
              <CardHeader>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "25%" }}>
                    <div>
                      <p><b>STDY0343220012</b></p>
                      <p style={{ color: "gray" }}>Chest xray for disease, 2 series</p>
                    </div>
                  </SplitItem>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p>10th March 2021</p>  
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>Olivia Guzman</p>
                      <p style={{ color: "gray" }}>PATID000320012</p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>
            </Card>
          </GridItem>

          <GridItem>
            <Card isSelectable isSelected={selected.includes("item2")} onClick={()=> select("item2")}>
              <CardHeader>
                <Split style={{ width: "100%" }}>
                  <SplitItem style={{ width: "25%" }}>
                    <div>
                      <p><b>STDY0343220013</b></p>
                      <p style={{ color: "gray" }}>Chest xray for disease, 1 series</p>
                    </div>
                  </SplitItem>
                  <SplitItem style={{ width: "20%" }}>
                    <div>
                      <p>10th March 2021</p>  
                    </div>
                  </SplitItem>
                  <SplitItem>
                    <div>
                      <p>Olivia Guzman</p>
                      <p style={{ color: "gray" }}>PATID000320012</p>
                    </div>
                  </SplitItem>
                  <SplitItem isFilled />
                  <SplitItem>
                    <Button variant="secondary">Browse</Button>
                  </SplitItem>
                </Split>
              </CardHeader>
            </Card>
          </GridItem>
        </Grid>
      </article>}

      <br /><br /><br /><br />
    </Wrapper>
  )
}
